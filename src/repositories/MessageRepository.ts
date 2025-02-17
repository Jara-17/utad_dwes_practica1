import Message, { IMessage } from "../models/Message";

class MessageRepository {
  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    return await Message.create(data);
  }

  async getMessagesByUser(userId: string): Promise<IMessage[]> {
    return await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });
  }

  async getConversation(
    senderId: string,
    receiverId: string
  ): Promise<IMessage[]> {
    return await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
  }

  async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<IMessage | null> {
    return await Message.findOneAndUpdate(
      { _id: messageId },
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );
  }
}

export default new MessageRepository();
