import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete,
    UseGuards,
    Request
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('cms/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    create(@Request() req, @Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto, req.user._id);
    }

    @Get()
    findAll(@Request() req) {
        return this.productsService.findAll(req.user._id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.productsService.findOne(id, req.user._id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto, req.user._id);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.productsService.remove(id, req.user._id);
    }
} 