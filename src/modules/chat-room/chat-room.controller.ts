import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { CreateChatRoomMultipleDto } from './dto/create-chat-room-multiple.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatRoomGateway } from './gateways/chat-room.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@ApiTags('chat')
@Controller('chat')
export class ChatRoomController {
  constructor(
    private readonly chatService: ChatRoomService,
    private readonly chatGateway: ChatRoomGateway,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('room/:chatRoomId/messages')
  async getMessages(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: number,
  ) {
    const messages = await this.chatService.getMessages(chatRoomId);

    return messages.map((item) => {
      const data = item.get();
      return {
        ...data,
        isSender: data.idSender === user.id,
      };
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('room/multiple')
  async addMessages(
    @CurrentUser() user: User,
    @Body() body: CreateChatRoomMultipleDto,
  ) {
    return this.chatService.createRoomMultiple(
      user?.id,
      body.idUsers,
      body.name,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('room')
  findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ChatRoom>> {
    const limit = query.limit!;
    const offset = query.offset!;
    return this.chatService.findAll(limit, offset, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('room')
  async createRoom(
    @CurrentUser() user: User,
    @Body() body: CreateChatRoomMultipleDto,
  ) {
    return this.chatService.createRoom(user?.id, body.idUsers, body.name);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('room/private')
  async createOrGetPrivateRoom(
    @CurrentUser() user: User,
    @Body() body: CreateChatRoomDto,
  ) {
    return this.chatService.getOrCreatePrivateRoom(
      body.idUser,
      user.id,
      body.name,
    );
  }

  @Post('room/message')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `chat-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  createRoomMessage(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMessageDto,
  ): Promise<Message> {
    const payload: CreateMessageDto & { idSender: number } = {
      ...dto,
      idSender: user.id,
      resourceUrl: file ? `/uploads/chat/${file.filename}` : undefined,
    };

    return this.chatService.createRoomMessage(payload);
  }


  
  @Delete('room/message/:id')
  removeRoomMessage(@Param('id') id: number) {
      return this.chatService.removeRoomMessage(+id);
  }

   
  @Delete('room/:id')
  removeRoom(@Param('id') id: number) {
      return this.chatService.removeRoom(+id);
  }

  @Delete('room/userGroup/:id')
  removeUserGroup(@Param('id') id: number) {
      return this.chatService.removeUserGroup(+id);
  }
}
