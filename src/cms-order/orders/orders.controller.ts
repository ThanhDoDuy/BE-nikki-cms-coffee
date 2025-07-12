import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Delete,
    HttpCode,
    HttpStatus,
    Put,
    UseGuards,
    Request
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('cms/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto, req.user._id);
    }

    @Get()
    findAll(@Request() req) {
        return this.ordersService.findAll(req.user._id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.ordersService.findOne(id, req.user._id);
    }

    @Put(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(id, updateOrderDto, req.user._id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Request() req, @Param('id') id: string) {
        return this.ordersService.remove(id, req.user._id);
    }
} 