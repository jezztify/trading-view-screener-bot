/**
 * Copied from https://dev.to/heymarkkop/how-to-implement-test-and-mock-discordjs-v13-slash-commands-with-typescript-22lc
 * I do not own this piece of code
 */ 
import {
  Client,
  User,
  CommandInteraction,
  GatewayIntentBits,
} from "discord.js";

type tCommand = {
  id: string,
  name: string,
  type: number,
  options: {
    type: number,
    name: string,
    options: {
      value: string,
      type: number,
      name: string
    }[],
  }[]
}

export default class DiscordMock {
  private client!: Client;
  private user!: User;
  public interaction!: CommandInteraction;

  constructor(options: tCommand) {
    this.mockClient();
    this.mockUser();
    this.mockInteracion(options?.name)
  }

  public getInteraction(): CommandInteraction {
    return this.interaction;
  }

  private mockClient(): void {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this.client.login = jest.fn(() => Promise.resolve("LOGIN_TOKEN"));
  }

  private mockUser(): void {
    this.user = Reflect.construct(User, [
        this.client, {
          id: "user-id",
          username: "USERNAME",
          discriminator: "user#0000",
          avatar: "user avatar url",
          bot: false,
        }
      ]
    )
  }

  private mockInteracion(command: string): void {
    this.interaction = Reflect.construct(CommandInteraction, [
      this.client,
        {
          data: command,
          id: BigInt(1),
          user: this.user,
        }
      ]
    )
    this.interaction.reply = jest.fn()
    this.interaction.isCommand = jest.fn(() => true)
  }
}
