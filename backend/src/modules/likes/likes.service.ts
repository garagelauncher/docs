<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLikeDto: CreateLikeDto) {
    return this.prisma.like.create({ data: createLikeDto });
  }

  findAll() {
    return this.prisma.like.findMany({});
  }

  async findOne(id: string) {
     //return this.prisma.category.findUnique({ where: { id } });

=======
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma.service';
import { PushNotificationsService } from 'src/shared/services/push-notifications/push-notifications.service';
import {
  PaginateOptions,
  parsePaginationToPrisma,
} from 'src/shared/utils/parsePaginationToPrisma';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  fireAndForgetLikeNotification(like: Like) {
    this.notifyUserAboutLike(like);
  }

  async notifyUserAboutLike(like: Like) {
    const { postId } = like;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            preferences: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post ${postId} was not found`);
    }

    const deviceTokens = await this.prisma.device.findMany({
      where: {
        ownerId: post.owner.id,
      },
    });

    const tokens = deviceTokens.map((device) => device.token);

    console.log(tokens);
    console.log({
      title: 'Nova curtida',
      body: `${post.owner.name} curtiu seu post`,
    });
    this.pushNotificationsService.sendPushNotifications(tokens, {
      title: 'Nova curtida',
      body: `${post.owner.name} curtiu seu post`,
    });
  }

  create(createLikeDto: Like) {
    return this.prisma.like.create({ data: createLikeDto });
  }

  async findAll(options: PaginateOptions) {
    const { skip, take, where, orderBy, include, cursor } =
      parsePaginationToPrisma<Prisma.LikeWhereInput>(options);

    return await this.prisma.like.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
      cursor,
    });
  }

  async findOne(id: string) {
>>>>>>> refactor/setupTests
    const like = await this.prisma.like.findUnique({
      where: {
        id,
      },
    });
<<<<<<< HEAD
=======

    if (!like) {
      throw new NotFoundException(`Like ${id} was not found`);
    }

>>>>>>> refactor/setupTests
    return like;
  }

  update(id: string, UpdateLikeDto: UpdateLikeDto) {
    return this.prisma.like.update({
      where: { id },
      data: UpdateLikeDto,
    });
  }

<<<<<<< HEAD
  remove(id: string) {
=======
  remove({ postId, id }: DeleteLikeDto) {
    Logger.warn(`Removed like ${id} from post ${postId}`);
>>>>>>> refactor/setupTests
    return this.prisma.like.delete({ where: { id } });
  }
}
