import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from 'src/modules/categories/categories.service';
import { PrismaService } from 'src/shared/database/prisma.service';
import { categoryMock } from 'test/__mocks__/category';
import { createPrismaProviderMock } from 'test/__mocks__/prisma';

describe('CategoriesService', () => {
  let categoryService: CategoriesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, createPrismaProviderMock()],
    }).compile();

    categoryService = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);

    prisma.category.create = jest.fn().mockResolvedValue(categoryMock);
    prisma.category.delete = jest.fn().mockResolvedValue(categoryMock);
    prisma.category.update = jest.fn().mockResolvedValue({
      ...categoryMock,
      title: 'novo título da categoria',
      description: 'descrição atualizada de saúde',
    });
    prisma.category.findMany = jest.fn().mockResolvedValue([categoryMock]);
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  it('should be able to create a category with success', async () => {
    const category = {
      id: 'aaaaaa-1111-aaaaaaa-1111',
      name: 'saúde',
      title: 'saúde',
      description: 'categoria de saúde',
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
      ownerId: '01923408oaskfjoasdj=jiasfjsdi-oiashjdfk',
    };

    const createdCategory = await categoryService.create(category);
    expect(createdCategory).toEqual(categoryMock);
  });

  it('should be able to find one category', async () => {
    const category = {
      id: 'aaaaaa-1111-aaaaaaa-1111',
      name: 'saúde',
      title: 'saúde',
      description: 'categoria de saúde',
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
      ownerId: '01923408oaskfjoasdj=jiasfjsdi-oiashjdfk',
    };

    await categoryService.findOne(category.id);
    expect(category).toEqual(categoryMock);
  });

  it('should be able to delete a category with success', async () => {
    const deletedCategory = await categoryService.remove(
      'aaaaaa-1111-aaaaaaa-1111',
    );
    expect(deletedCategory).toEqual(categoryMock);
  });

  it('should be able to update a category with success', async () => {
    const categoryToUpdate = {
      title: 'novo título da categoria',
      description: 'descrição atualizada de saúde',
    };

    const categoryUpdated = await categoryService.update(
      categoryMock.description,
      categoryToUpdate,
    );

    expect(categoryUpdated).toEqual({
      ...categoryMock,
      title: 'novo título da categoria',
      description: 'descrição atualizada de saúde',
    });
  });

  it('should be able to get one category by id with success', async () => {
    prisma.category.findUnique = jest.fn().mockResolvedValue(categoryMock);
    const foundCategory = await categoryService.findOne(
      'aaaaaa-1111-aaaaaaa-1111',
    );

    const expectedCategory = {
      ...categoryMock,
    };

    expect(foundCategory).toEqual(expect.objectContaining(expectedCategory));
  });

  it('should be able to findAll categories', async () => {
    const categories = await categoryService.findAll({});
    expect(categories).toEqual([categoryMock]);
  });
});
