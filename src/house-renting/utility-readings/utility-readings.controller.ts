import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { UtilityReadingsService } from './utility-readings.service';
import { CreateUtilityReadingDto } from './dto/create-utility-reading.dto';
import { UpdateUtilityReadingDto } from './dto/update-utility-reading.dto';

@Controller('utility-readings')
export class UtilityReadingsController {
  constructor(private readonly utilityReadingsService: UtilityReadingsService) {}

  @Post()
  create(@Body() createUtilityReadingDto: CreateUtilityReadingDto) {
    return this.utilityReadingsService.create(createUtilityReadingDto);
  }

  @Get()
  findAll(@Query('month') month?: string) {
    if (month) {
      return this.utilityReadingsService.findByMonth(month);
    }
    return this.utilityReadingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utilityReadingsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUtilityReadingDto: UpdateUtilityReadingDto) {
    return this.utilityReadingsService.update(id, updateUtilityReadingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utilityReadingsService.remove(id);
  }
} 