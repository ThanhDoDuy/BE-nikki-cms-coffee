import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto, UpdateMealDto } from './dto/create-meal.dto';

@Controller('meals')
export class MealsController {
    constructor(private readonly mealsService: MealsService) { }

    @Post()
    create(@Body() createMealDto: CreateMealDto) {
        return this.mealsService.create(createMealDto);
    }

    @Get()
    findAll(@Query('page') page = '1', @Query('limit') limit = '10', @Query('search') search = '') {
      return this.mealsService.findAll(+page, +limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mealsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateMealDto: UpdateMealDto) {
      return this.mealsService.update(id, updateMealDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mealsService.remove(id);
    }
}
