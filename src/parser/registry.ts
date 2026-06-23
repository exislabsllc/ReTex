import type { CommandDefinition, EnvironmentDefinition } from "../types/index.js";

/**
 * The command/environment registry. The parser consults it for argument
 * signatures and node builders; the plugin system mutates it. A registry can
 * be cloned cheaply so an engine instance never mutates shared global state.
 */
export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();
  private environments = new Map<string, EnvironmentDefinition>();

  registerCommand(def: CommandDefinition): this {
    this.commands.set(def.name, def);
    return this;
  }

  registerEnvironment(def: EnvironmentDefinition): this {
    this.environments.set(def.name, def);
    return this;
  }

  getCommand(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  getEnvironment(name: string): EnvironmentDefinition | undefined {
    return this.environments.get(name);
  }

  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }

  hasEnvironment(name: string): boolean {
    return this.environments.has(name);
  }

  commandNames(): string[] {
    return [...this.commands.keys()];
  }

  environmentNames(): string[] {
    return [...this.environments.keys()];
  }

  allCommands(): CommandDefinition[] {
    return [...this.commands.values()];
  }

  allEnvironments(): EnvironmentDefinition[] {
    return [...this.environments.values()];
  }

  /** Shallow-clone the registry (definitions are shared, maps are copied). */
  clone(): CommandRegistry {
    const next = new CommandRegistry();
    next.commands = new Map(this.commands);
    next.environments = new Map(this.environments);
    return next;
  }
}
