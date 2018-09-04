import { BotCommand } from "../../src/bot-commands/bot-command";
import { Chat } from "../../src/chat/chat";
import { User } from "../../src/chat/user/user";
import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";

export class Plugin extends AbstractPlugin {

  constructor() {
    super("Donation", "1.0.0");
    console.log("Donation plugin started :)");
  }

  /**
   * @override
   */
  public getPluginSpecificCommands(): BotCommand[] {
    const donatecommand = new BotCommand("donate", "donates points to a poor user", this.donate.bind(this));
    return [donatecommand];
  }

  private specifiedDonationAmount(msg: any): number {
    return Number(msg.text.split(" ")[1]);
  }

  private verifyInputs(chat: Chat, user: User, msg: any, match: string[]): string {
    if (msg.reply_to_message === null || msg.reply_to_message.from === null ) {
      return "✋  I only work when you reply to a message by the user you are trying to donate to.";
    }
    if (msg.reply_to_message.from.id === user.id) {
      return "🐔  Donating to yourself is lame.";
    }
    const split = msg.text.split(" ");
    if (split.length < 2) {
      return "✋  Not enough arguments! Format: /donate [amount]";
    }
    const amount = this.specifiedDonationAmount(msg);
    if (isNaN(amount) || (amount % 1 !== 0) || amount < 0 ) {
      return "✋  Your amount has to be a whole numeric value, you little rascal.";
    }
    if (amount > user.score) {
      return "✋  You can't give away more than you own.";
    }
    return null;
  }

  private donatePoints(from: User, to: User, amount: number) {
    from.addToScore(-amount);
    to.addToScore(amount);
  }

  private donate(chat: Chat, user: User, msg: any, match: string[]): string {
    const inputError = this.verifyInputs(chat, user, msg, match);
    if ( inputError != null) {
      return inputError;
    } 

    const recipientId: number = msg.reply_to_message.from.id;
    const recipient: User = chat.getOrCreateUser(recipientId, msg.reply_to_message.from.username);

    const amount = this.specifiedDonationAmount(msg);
    this.donatePoints(user, recipient, amount);

    return "🎉 " + msg.from.username + " donated " + amount + " internet points to " + recipient.name + " 🎉 ";
  }
}
