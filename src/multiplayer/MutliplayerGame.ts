import { JsonObject, JsonProperty } from "json2typescript";
import * as _ from "lodash";
import User from "../sessions/User";
import MultiplayerGameType from "./MultiplayerGameType";
import Albatross from "../Albatross";
import ServerPacketChangeGameHost from "../packets/server/ServerPacketChangeGameHost";
import Lobby from "./Lobby";
import ServerPacketMultiplayerGameInfo from "../packets/server/ServerPacketMultiplayerGameInfo";
import MultiplayerGameRuleset from "./MultiplayerGameRuleset";
import GameMode from "../enums/GameMode";
const md5 = require("md5");

@JsonObject("MultiplayerGame")
export default class MultiplayerGame {
    /**
     * A unique identifier for the game
     */
    @JsonProperty("id")
    public Id: string = "";

    /**
     * The type of multiplayer game this is.
     */
    @JsonProperty("t")
    public Type: MultiplayerGameType = MultiplayerGameType.Friendly;

    /**
     * The name of the game
     */
    @JsonProperty("n")
    public Name: string = "";

    /**
     * The password for the game, if any
     */
    public Password: string | null = null;

    /**
     * If the game has a password on it
     */
    @JsonProperty("hp")
    public HasPassword: boolean = false;

    /**
     * The maximum players allowed in the game
     */
    @JsonProperty("mp")
    public MaxPlayers: number = 16;

    /**
     * The Md5 hash of the map
     */
    @JsonProperty("md5")
    public MapMd5: string = "";

    /**
     * The ID of the map
     */
    @JsonProperty("mid")
    public MapId: number = -1;
    
    /**
     * The mapset id of the map.
     */
    @JsonProperty("msid")
    public MapsetId: number = -1;

    /**
     * The title of the map.
     */
    @JsonProperty("map")
    public Map: string = "";

    /**
     * The ids of the players in the game
     */
    @JsonProperty("ps")
    public PlayerIds: number[] = [];

    /**
     * The id of the game host.
     */
    @JsonProperty("h")
    public HostId: number = -1;

    /**
     * The ruleset of the game (teams, ffa, etc.)
     */
    @JsonProperty("r")
    public Ruleset: MultiplayerGameRuleset = MultiplayerGameRuleset.Free_For_All;

    /**
     * Whether the server will control host rotation for the match
     */
    @JsonProperty("hr")
    public HostRotation: boolean = false;

    /**
     * The game mode for the currently selected map
     */
    @JsonProperty("gm")
    public GameMode: GameMode = GameMode.Keys4;

    /**
     * The difficulty rating of the currently selected map.
     */
    @JsonProperty("d")
    public DifficultyRating: number = 0;

    /**
     * The players that are currently in the game
     */
    public Players: User[] = [];

    /**
     * The host of the game, if any
     */
    public Host: User | null = null;

    /**
     * Creates and returns a multiplayer game
     * @param type 
     * @param name 
     * @param password 
     * @param maxPlayers 
     * @param host 
     */
    public static Create(type: MultiplayerGameType, name: string, password: string | null, maxPlayers: number, mapMd5: string, 
        mapId: number, mapsetId: number, map: string, ruleset: MultiplayerGameRuleset, hostRotation: boolean, mode: GameMode, difficultyRating: number,
        host: User | null = null): MultiplayerGame {

        const game: MultiplayerGame = new MultiplayerGame();

        game.Type = type;
        game.Id = game.GenerateGameIdentifier();
        game.Name = name;
        game.Host = host;
        game.MaxPlayers = game.ClampMaxPlayers(maxPlayers);
        game.MapMd5 = mapMd5;
        game.MapId = mapId;
        game.MapsetId = mapsetId;
        game.Map = map;
        game.Ruleset = ruleset;
        game.HostRotation = hostRotation;
        game.GameMode = mode;
        game.DifficultyRating = difficultyRating;
        game.Password = password;
        if (password) game.HasPassword = true;

        return game;
    }

    /**
     * Returns a unique identifier for this game.
     */
    private GenerateGameIdentifier(): string {
        return md5(Date.now() + this.Name + this.MaxPlayers + this.Type + this.HasPassword);
    }

    /**
     * Sets the maximum players allowed in the game.
     * 
     * Gives administrators the privilege to create massive games.
     * @param numPlayers 
     */
    private ClampMaxPlayers(numPlayers: number): number {
        if (this.Host && this.Host.IsDeveloper())
            return _.clamp(numPlayers, 2, 100);
        else
            return _.clamp(numPlayers, 2, 16);
    }

    /**
     * Changes the host of the game.
     * @param user 
     */
    public ChangeHost(user: User): void {
        this.Host = user;
        this.HostId = user.Id;
        Albatross.SendToUsers(this.Players, new ServerPacketChangeGameHost(user));
    } 

    /**
     * Returns if the game is full
     */
    public IsFull(): boolean {
        return this.Players.length == this.MaxPlayers;
    }

    public UpdateSettings(): void {
        Albatross.SendToUsers(Lobby.Users, new ServerPacketMultiplayerGameInfo(this));
    }
}