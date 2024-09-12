import {
  Body,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsSevices');
  onModuleInit() {
    this.$connect();
    this.logger.log('Database Connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalItem = await this.product.count();
    const lastPage = Math.ceil(totalItem / limit);
    return {
      data: await this.product.findMany({
        take: limit,
        skip: page - 1,
      }),
      meta: {
        totalItem: totalItem,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id: id },
    });
    if (!product) {
      throw new NotFoundException(`product with id ${id} not found`);
    }
    return product;
  }

  @Patch('id')
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('');
    }
    return this.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`product with ${id} not found`);
    }
    return this.product.delete({ where: { id } });
  }
}
