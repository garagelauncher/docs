import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
<<<<<<< HEAD
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  title: string;
=======
  name: string;

  @ApiProperty({
    description: 'O título é utilizado para identificar o tema geral abordado pela categoria.',
    example: 'Saúde',
  })
  title: string;

  @ApiProperty({
    description: 'O ícone será utilizado como elemento visual da categoria.',
    example: '[URL da imagem]',
  })
  icon?: string;

  @ApiProperty({
    description: 'Breve descrição do tema abordado pela categoria.',
    example: 'Nesta categoria poderão ser debatidos temas como alimentação, rotina de exercícios e desenvolvimento social',
  })
  description?: string;
>>>>>>> refactor/setupTests
}
