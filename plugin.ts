import { BotCommand } from "../../src/bot-commands/bot-command";
import { AlterUserScoreArgs } from "../../src/chat/alter-user-score-args";
import { Chat } from "../../src/chat/chat";
import { User } from "../../src/chat/user/user";
import { AbstractPlugin } from "../../src/plugin-host/plugin/plugin";

const PLUGIN_NAME = "Donate";

export class Plugin extends AbstractPlugin {

  constructor() {
    super(PLUGIN_NAME, "1.1.0");
  }

  public getPluginSpecificCommands(): BotCommand[] {
    const donatecommand = new BotCommand("donate", "Donate points another user", this.donate);
    return [donatecommand];
  }

  private specifiedDonationAmount(msg: any): number {
    return Number(msg.text.split(" ")[1]);
  }

  private verifyInputs(chat: Chat, user: User, msg: any, match: string[]): string {
    if (msg.reply_to_message === null) {
      return "I only work when you reply to a message by the user you are trying to donate to";
    }
    if (msg.reply_to_message.from.id === user.id) {
      return "Donating to yourself? Weirdo";
    }
    const split = msg.text.split(" ");
    if (split.length < 2) {
      return "✋  Not enough arguments! Format: /donate [amount]";
    }
    const amount = this.specifiedDonationAmount(msg);

    if (isNaN(amount) || (amount % 1 !== 0) || amount < 1 ) {
      return "✋  The amount has to be a whole numeric value";
    }
    if (amount > user.score) {
      return "✋  You can't give away more than you own";
    }
    return null;
  }

  private donatePoints(donator: User, recipient: User, amount: number, chat: Chat) {
    chat.alterUserScore(new AlterUserScoreArgs(donator, -amount, PLUGIN_NAME, "donation.given"));
    chat.alterUserScore(new AlterUserScoreArgs(recipient, amount, PLUGIN_NAME, "donation.received"));
  }

  private donate = (chat: Chat, user: User, msg: any, match: string[]): string => {
    const inputError = this.verifyInputs(chat, user, msg, match);
    if ( inputError != null) {
      return inputError;
    } 

    const recipientId: number = msg.reply_to_message.from.id;
    const recipient: User = chat.getOrCreateUser(recipientId, msg.reply_to_message.from.username);

    const amount = this.specifiedDonationAmount(msg);
    this.donatePoints(user, recipient, amount, chat);

    return "🎉 " + msg.from.username + " donated " + amount + " internet points to " + recipient.name + " 🎉 ";
  }
}
