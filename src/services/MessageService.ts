import MessageRepository from "../repositories/MessageRepository";
import { IMessage } from "../models/Message";
import { Types } from "mongoose";

class MessageService {
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<IMessage> {
    const sender = new Types.ObjectId(senderId);
    const receiver = new Types.ObjectId(receiverId);

    return await MessageRepository.createMessage({
      senderId: sender,
      receiverId: receiver,
      content,
    });
  }

  async getUserMessages(userId: string): Promise<IMessage[]> {
    return await MessageRepository.getMessagesByUser(userId);
  }

  async getConversation(
    senderId: string,
    receiverId: string
  ): Promise<IMessage[]> {
    return await MessageRepository.getConversation(senderId, receiverId);
  }

  async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<IMessage | null> {
    return await MessageRepository.deleteMessage(messageId, userId);
  }
}

export default new MessageService();
