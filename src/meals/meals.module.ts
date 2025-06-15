import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { MealSchema } from './schemas/meal.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Meal', schema: MealSchema }])],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule { }
