import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    @Post()
    create(@Body() dto: CreateRoomDto) {
        return this.roomsService.create(dto);
    }

    @Get()
    findAll(@Query('page') page = '1', @Query('limit') limit = '10', @Query('search') search = '') {
        return this.roomsService.findAll(+page, +limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.roomsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CreateRoomDto>) {
        return this.roomsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.roomsService.remove(id);
    }
}
