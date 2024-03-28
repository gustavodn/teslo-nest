import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/NewMessageDto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wws: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}
  handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization;
    console.log('token', token);
    let payload: JwtPayload;

    if (!token) {
      client.disconnect();
      return;
    }

    // check if the token is valid
    try {
      payload = this.jwtService.verify(token);
      this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    console.log('payload', payload);

    this.wws.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client);
    this.wws.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log(client.id, payload.message);
    // emit to the client that sent the message
    console.log(this.messagesWsService.getUserFullName(client.id));
    this.wws.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message,
    });
    // emit to all clients
    // this.wws.emit('message-from-server', { message: 'New message' });

    // emit to all clients except the one that sent the message
    // client.broadcast.emit('message-from-server', { message: 'New message' });
  }
}
