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
import ServerPacketGameMapChanged from "../packets/server/ServerPacketGameMapChanged";
import ServerPacketGameStart from "../packets/server/ServerPacketGameStart";
import ServerPacketGameEnded from "../packets/server/ServerPacketGameEnded";
import ServerPacketAllPlayersSkipped from "../packets/server/ServerPacketGameAllPlayersSkipped";
import ServerPacketGamePlayerReady from "../packets/server/ServerPacketGamePlayerReady";
import ServerPacketGamePlayerNotReady from "../packets/server/ServerPacketGamePlayerNotReady";
import Logger from "../logging/Logger";
import ServerPacketGameStartCountdown from "../packets/server/ServerPacketGameStartCountdown";
import ServerPacketGameStopCountdown from "../packets/server/ServerPacketGameStopCountdown";
import ServerPacketDifficultyRangeChanged from "../packets/server/ServerPacketGameDifficultyRangeChanged";
import ServerPacketGameMaxSongLengthChanged from "../packets/server/ServerPacketGameMaxSongLengthChanged";
import ServerPacketGameAllowedModesChanged from "../packets/server/ServerPacketGameAllowedGameModesChanged";
import ModIdentifiers from "../enums/ModIdentifiers";
import ServerPacketGameChangeModifiers from "../packets/server/ServerPacketGameChangeModifiers";
import Bot from "../bot/Bot";
import ModHelper from "../utils/ModHelper";
import MultiplayerFreeModType from "./MultiplayerFreeModType";
import ServerPacketFreeModTypeChanged from "../packets/server/ServerPacketFreeModTypeChanged";
import MultiplayerPlayerMods from "./MultiplayerPlayerMods";
import ServerPacketGamePlayerChangeModifiers from "../packets/server/ServerPacketGamePlayerChangeModifiers";
import ServerPacketGameKicked from "../packets/server/ServerPacketGameKicked";
import ServerPacketGameNameChanged from "../packets/server/ServerPacketGameNameChanged";
import ServerPacketGameInvite from "../packets/server/ServerPacketGameInvite";
import MultiplayerHealthType from "./MultiplayerHealthType";
import ServerPacketGameHealthTypeChanged from "../packets/server/ServerPacketGameHealthTypeChanged";
import ServerPacketGameLivesChanged from "../packets/server/ServerPacketGameLivesChanged";
import ServerPacketGameHostRotationChanged from "../packets/server/ServerPacketGameHostRotationChanged";
import PlayerIdToScoreProccessorMap from "./maps/PlayerIdToScoreProcesorMap";
import ScoreProcessorKeys from "../processors/ScoreProcessorKeys";
import Judgement from "../enums/Judgement";
import ScoreProcessorMultiplayer from "../processors/ScoreProcessorMultiplayer";
import MultiplayerTeam from "./MultiplayerTeam";
import ServerPacketGamePlayerTeamChanged from "../packets/server/ServerPacketGamePlayerTeamChanged";
import ServerPacketGameRulesetChanged from "../packets/server/ServerPacketGameRulesetChanged";
import ChatManager from "../chat/ChatManager";
import ChatChannel from "../chat/ChatChannel";
const md5 = require("md5");

/**
 * Command List:
 * https://gist.github.com/Swan/f0a0b5beb581190ce1a267511f60ac98
 */
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
    public AutoHostRotation: boolean = false;

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
     * Players in the match that don't have the current map
     */
    @JsonProperty("pwm")
    public PlayersWithoutMap: number[] = [];

    /**
     * If the match is currently in progress.
     */
    @JsonProperty("p")
    public InProgress: boolean = false;

    /**
     * List of all ready players (ids, and serialized).
     */
    @JsonProperty("pri")
    public PlayersReady: number[] = [];

    /**
     * Unix timestamp of the time the match start countdown has started
     */
    @JsonProperty("cst")
    public CountdownStartTime: number = -1;

    /**
     * The minimium difficulty rating allowed for maps in this lobby
     */
    @JsonProperty("mind")
    public MinimumDifficultyRating: number = 0;

    /**
     * THe maximum difficulty rating allowed for maps in this lobby
     */
    @JsonProperty("maxd")
    public MaximumDifficultyRating: number = 9999;

    /**
     * The maximum length allowed for songs in the lobby
     */
    @JsonProperty("maxl")
    public MaximumSongLength: number = 999999999;

    /**
     * The game modes that are allowed to be selected in this multiplayer match
     */
    @JsonProperty("ag")
    public AllowedGameModes: GameMode[] = [GameMode.Keys4, GameMode.Keys7];

    /**
     * The currently activated mods for the match
     */
    @JsonProperty("md")
    public Modifiers: string = "0";

    /**
     *  Free mod & which type is enabled for this match
     */
    @JsonProperty("fm")
    public FreeModType: MultiplayerFreeModType = 0;

    /**
     * The modifiers that each individual player has activated (in free mod)
     */
    @JsonProperty("pm")
    public PlayerMods: MultiplayerPlayerMods[] = [];

    /**
     * The way health is handled in this multiplayer game
     */
    @JsonProperty("ht")
    public HealthType: MultiplayerHealthType = MultiplayerHealthType.ManualRegeneration;

    /**
     * The amount of lives for each player in the multiplayer game
     */
    @JsonProperty("lv")
    public Lives: number = 3;

    /**
     * Players that are on the red team
     */
    @JsonProperty("rtp")
    public RedTeamPlayers: number[] = [];

    /**
     * Players that are on the blue team
     */
    @JsonProperty("btp")
    public BlueTeamPlayers: number[] = [];

    /**
     * The players that are currently in the game
     */
    public Players: User[] = [];

    /**
     * The host of the game, if any
     */
    public Host: User | null = null;

    /**
     * The players that the game has started with.
     */
    public PlayersGameStartedWith: User[] = [];

    /**
     * The amount of players that have finished the map.
     */
    public FinishedPlayers: User[] = [];

    /**
     * The amount of players in the match that have their gameplay screen loaded
     * and are ready to start.
     * 
     * When all PlayersGameStartedWith has the same people as in this, 
     * the game will begin.
     * 
     * This is so everyone can begin the song at around the exact same time.
     */
    public PlayersWithGameScreenLoaded: User[] = [];

    /**
     * The players in the game that have requested to skip.
     */
    public PlayersSkipped: User[] = [];

    /**
     * If the match has already been skipped or not.
     */
    public MatchSkipped: boolean = false;

    /**
     * The physical countdown timeout handler.
     */
    private CountdownTimer: any;
    
    /**
     * A list of players that have been invited to the game
     */
    public PlayersInvited: User[] = [];

    /**
     * Calculated player scores server side
     */
    public PlayerScoreProcessors: PlayerIdToScoreProccessorMap = {};

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
        game.AutoHostRotation = hostRotation;
        game.GameMode = mode;
        game.DifficultyRating = difficultyRating;
        game.InProgress = false;
        game.CountdownTimer = -1;
        game.MinimumDifficultyRating = 0;
        game.MaximumDifficultyRating = 9999;
        game.MaximumSongLength = 999999999;
        game.AllowedGameModes = [GameMode.Keys4, GameMode.Keys7];
        game.Password = password;
        game.Modifiers = "0";
        game.FreeModType = MultiplayerFreeModType.None;
        game.PlayerMods = [];
        game.HealthType = MultiplayerHealthType.ManualRegeneration;
        game.Lives = 3;
        game.RedTeamPlayers = [];
        game.BlueTeamPlayers = [];
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
     * Returns if the game is full
     */
    public IsFull(): boolean {
        return this.Players.length == this.MaxPlayers;
    }

    /**
     * Changes the host of the game.
     * @param user
     * @param informLobbyUsers
     */
    public ChangeHost(user: User, informLobbyUsers: boolean = true): void {
        // User is already host
        if (this.Host == user)
            return;

        this.Host = user;
        this.HostId = user.Id;

        this.StopMatchCountdown(false);
        Albatross.SendToUsers(this.Players, new ServerPacketChangeGameHost(user));

        if (informLobbyUsers)
            this.InformLobbyUsers();
    } 

    /**
     * Changes the name of the game
     */
    public ChangeName(name: string): void {
        this.Name = name;

        Albatross.SendToUsers(this.Players, new ServerPacketGameNameChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Changes the selected map of the game
     */
    public ChangeMap(md5: string, mapId: number, mapsetId: number, map: string, mode: GameMode, difficulty: number): void {
        // Prevent diffs not in range
        if (difficulty < this.MinimumDifficultyRating || difficulty > this.MaximumDifficultyRating)
            return Logger.Warning(`[${this.Id}] Multiplayer map change failed. Difficulty rating not in min-max range.`);

        // Prevent disallowed game modes
        if (!this.AllowedGameModes.includes(mode))
            return Logger.Warning(`[${this.Id}] Multiplayer map change failed. Game mode not allowed`);

        this.MapMd5 = md5;
        this.MapId = mapId;
        this.MapsetId = mapsetId;
        this.Map = map;
        this.GameMode = mode;
        this.DifficultyRating = difficulty;

        this.PlayersWithoutMap = [];
        this.PlayersReady = [];

        this.StopMatchCountdown(false); 
        Albatross.SendToUsers(this.Players, new ServerPacketGameMapChanged(md5, mapId, mapsetId, map, mode, difficulty));    
        this.InformLobbyUsers();
    }

    /**
     * Changes the password of the game
     * @param password 
     */
    public ChangePassword(password: string | null): void {
        this.Password = password;
        this.HasPassword = password != null;


        // TODO: Send packet to users currently in the game.

        this.InformLobbyUsers();
    }

    /**
     * Starts the multiplayer game
     */
    public Start(): void {
        if (this.InProgress)
            return;

        Logger.Success(`[${this.Id}] Multiplayer Game Started!`);
        this.InProgress = true;
        this.PlayersGameStartedWith = this.Players.filter(x => !this.PlayersWithoutMap.includes(x.Id));
        this.FinishedPlayers = [];
        this.PlayersWithGameScreenLoaded = [];
        this.PlayersSkipped = [];
        this.PlayersReady = [];
        this.CountdownStartTime = -1;
        this.ClearAndPopulateScoreProcessors();

        Albatross.SendToUsers(this.Players, new ServerPacketGameStart());
        this.InformLobbyUsers();
    }

    /**
     * Ends the multiplayer game
     */
    public End(): void {
        if (!this.InProgress)
            return;

        Logger.Success(`[${this.Id}] Multiplayer Game Ended!`);

        this.InProgress = false;
        this.MatchSkipped = false;
        this.PlayersGameStartedWith = [];
        this.FinishedPlayers = [];
        this.PlayersWithGameScreenLoaded = [];
        this.PlayersSkipped = [];
        this.PlayersReady = [];
        this.StopMatchCountdown();

        // Send packet to all users that the game has finished.
        Albatross.SendToUsers(this.Players, new ServerPacketGameEnded());

        // Give host to the next person if auto host rotation is enabled
        if (this.AutoHostRotation && this.Host) {
            const index: number = this.Players.indexOf(this.Host);

            if (index + 1 < this.Players.length)
                this.ChangeHost(this.Players[index + 1], false);
            else
                this.ChangeHost(this.Players[0], false);
        }

        // Calculate all players' total scores (done after the match completes, so we can calculate the *real* value
        // with the total amount of udgements)
        for (let p in this.PlayerScoreProcessors)
            this.PlayerScoreProcessors[p].CalculateTotalScore();

        this.InformLobbyUsers();
    }

    /**
     * Sends a packet to all users in the lobby that the settings/changes of/in the game has been updated.
     */
    public InformLobbyUsers(): void {
        Albatross.SendToUsers(Lobby.Users, new ServerPacketMultiplayerGameInfo(this));
    }

    /**
     * Informs all players that we're skipping the beginning of the song.
     */
    public HandleAllPlayersSkipped(): void {
        this.MatchSkipped = true;
        Albatross.SendToUsers(this.PlayersGameStartedWith, new ServerPacketAllPlayersSkipped());
    }

    /**
     * Starts the countdown before the game starts
     */
    public StartMatchCountdown(): void {
        if (this.CountdownStartTime != -1)
            return Logger.Warning(`[${this.Id}] Multiplayer Match Countdown Already Running (Cannot Start Again)`);
            
        Logger.Success(`[${this.Id}] Multiplayer Match Countdown Started`);

        this.CountdownStartTime = Date.now();
        this.CountdownTimer = setTimeout(() => this.Start(), 5000);

        Albatross.SendToUsers(this.Players, new ServerPacketGameStartCountdown(this.CountdownStartTime));
        this.InformLobbyUsers();
    }

    /**
     * Cancels the match countdown
     */
    public StopMatchCountdown(informLobbyUsers: boolean = true): void {
        if (this.CountdownStartTime == -1)
            return;

        Logger.Success(`[${this.Id}] Multiplayer Match Countdown Cancelled`);

        this.CountdownStartTime = -1;
        clearTimeout(this.CountdownTimer);

        Albatross.SendToUsers(this.Players, new ServerPacketGameStopCountdown());

        if (informLobbyUsers)
            this.InformLobbyUsers();
    }
    
    /**
     * Informs all players in the game and the lobby that a player is ready.
     * @param user 
     */
    public InformPlayerIsReady(user: User): void {
        Albatross.SendToUsers(this.Players, new ServerPacketGamePlayerReady(user));
        this.InformLobbyUsers();
    }

    /**
     * Informs all players in the game and the lobby that a player isn't ready
     * @param user 
     */
    public InformPlayerNotReady(user: User): void {
        Albatross.SendToUsers(this.Players, new ServerPacketGamePlayerNotReady(user));
        this.InformLobbyUsers();
    }

    /**
     * Returns the name of the multiplayer chat channel w/ its unique id.
     */
    public GetChatChannelName(): string { 
        return `#multiplayer_${this.Id}`;
    }

    /**
     * Returns the name of the multiplayer team chat channel w/ its unique id
     */
    public GetTeamChatChannelName(): string {
        return `#multi_team_${this.Id}`;
    }

    /**
     * Changes the minimum difficulty rating allowed for the match
     * @param num 
     */
    public ChangeMinimumDifficulty(num: number): void {
        this.MinimumDifficultyRating = num;
        Logger.Info(`[${this.Id}] Multiplayer game minimum difficulty rating changed: ${this.MinimumDifficultyRating}`);

        Albatross.SendToUsers(this.Players, new ServerPacketDifficultyRangeChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Changes the maximum difficulty rating allowed for the match
     */
    public ChangeMaximumDifficulty(num: number): void {
        this.MaximumDifficultyRating = num;
        Logger.Info(`[${this.Id}] Multiplayer game maximum difficulty rating changed: ${this.MaximumDifficultyRating}`);

        Albatross.SendToUsers(this.Players, new ServerPacketDifficultyRangeChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Changes the maximum allowed length of songs for the match
     * @param num 
     */
    public ChangeMaximumSongLength(num: number): void {
        this.MaximumSongLength = num;
        Logger.Info(`[${this.Id}] Multiplayer game maximum song length changed: ${num}`);

        Albatross.SendToUsers(this.Players, new ServerPacketGameMaxSongLengthChanged(this.MaximumSongLength));
        this.InformLobbyUsers();
    }

    /**
     * Allows a game mode to be selected for this game mode.
     * @param mode 
     */
    public AllowGameMode(mode: GameMode): void {
        if (this.AllowedGameModes.includes(mode))
            return;

        this.AllowedGameModes.push(mode);
        Logger.Info(`[${this.Id}] Allowed game mode: ${mode} for this multiplayer game.`);

        Albatross.SendToUsers(this.Players, new ServerPacketGameAllowedModesChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Disallows a game mode to be selected for this game mode.
     * @param mode 
     */
    public DisallowGameMode(mode: GameMode): void {
        if (!this.AllowedGameModes.includes(mode))
            return;

        this.AllowedGameModes = this.AllowedGameModes.filter(x => x != mode);
        Logger.Info(`[${this.Id}] Disallowed game mode: ${mode} for this multiplayer game.`);

        Albatross.SendToUsers(this.Players, new ServerPacketGameAllowedModesChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Changes the modifiers for the game & advertised difficulty rating
     */
    public ChangeModifiers(mods: string | any, difficultyRating: number): void {
        if (isNaN(mods))
            return Logger.Warning(`[${this.Id}] Multiplayer Mods Can't Be Changed (Mods given was NaN).`);

        this.Modifiers = mods;
        this.DifficultyRating = difficultyRating;
        Logger.Info(`[${this.Id}] Multiplayer Game Mods Changed: ${this.Modifiers} | Rating: ${difficultyRating}`);

        Albatross.SendToUsers(this.Players, new ServerPacketGameChangeModifiers(this));
        this.InformLobbyUsers();
    }

    /**
     * Changes the modifiers for an individual player
     * @param mods 
     */
    public ChangePlayerModifiers(user: User, mods: string | any, force: boolean = false): void {
        if (this.FreeModType == 0 && !force)
            return Logger.Warning(`[${this.Id}] Multiplayer - ${user.ToNameIdString()} Mods Can't Be Changed (Free Mod Not Enabled).`);

        if (isNaN(mods))
            return Logger.Warning(`[${this.Id}] Multiplayer - ${user.ToNameIdString()} Mods Can't Be Changed (Mods given was NaN).`);

        const playerMods: MultiplayerPlayerMods | undefined = this.PlayerMods.find(x => x.Id == user.Id);

        if (!playerMods)
            return Logger.Warning(`[${this.Id}] Multiplayer - ${user.ToNameIdString()} Mods Can't Be Changed (Player Mods don't exist???).`);

        playerMods.Mods = mods;
        Logger.Info(`[${this.Id}] Multiplayer - ${user.ToNameIdString()} <pds Changed: ${playerMods.Mods}.`);

        Albatross.SendToUsers(this.Players, new ServerPacketGamePlayerChangeModifiers(user, mods));
        this.InformLobbyUsers();
    }

    /**
     * Enables a specific free mod type for the match
     */
    public EnableFreeModType(type: MultiplayerFreeModType): void {
        if ((this.FreeModType & type) != 0)
            return;

        this.FreeModType |= type;
        
        Albatross.SendToUsers(this.Players, new ServerPacketFreeModTypeChanged(this));
        this.ChangeModifiers("0", this.DifficultyRating);

        for (let i = 0; i < this.Players.length; i++)
            this.ChangePlayerModifiers(this.Players[i], "0", true);

        this.InformLobbyUsers();
    }

    /**
     * Disables a specific free mod type for the match
     * @param type 
     */
    public DisableFreeModType(type: MultiplayerFreeModType): void {
        if ((this.FreeModType & type) != 0) {
            this.FreeModType -= type;
        }

        Albatross.SendToUsers(this.Players, new ServerPacketFreeModTypeChanged(this));
        this.ChangeModifiers("0", this.DifficultyRating);

        for (let i = 0; i < this.Players.length; i++)
            this.ChangePlayerModifiers(this.Players[i], "0", true);

        this.InformLobbyUsers();
    }

    /**
     * Kicks a player from the multiplayer game
     * @param user 
     */
    public KickPlayer(user: User): void {
        if (user.CurrentGame != this)
            return Logger.Warning(`[${this.Id}] Multiplayer - Could not kick ${user.ToNameIdString()} because they aren't in the game.`);

        Logger.Info(`[${this.Id}] Multiplayer - User Kicked: ${user.ToNameIdString()}`);
        
        _.remove(this.PlayersInvited, user);
        user.LeaveMultiplayerGame();
        Albatross.SendToUser(user, new ServerPacketGameKicked());
    }

    /**
     * Invites a player the multiplayer game
     * @param invitee 
     */
    public InvitePlayer(invitee: User, sender: User): void {
        if (!this.PlayersInvited.includes(invitee))
            this.PlayersInvited.push(invitee);

        Albatross.SendToUser(invitee, new ServerPacketGameInvite(this, sender));
    }

    /**
     * Changes the health type ofthe multiplayer game
     * @param type 
     */
    public ChangeHealthType(type: MultiplayerHealthType): void {
        if (this.InProgress)
            return Logger.Warning(`[${this.Id}] Multiplayer - Tried to change health type, but the game is already in progress.`);

        this.HealthType = type;

        Albatross.SendToUsers(this.Players, new ServerPacketGameHealthTypeChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Changes the amount of lives in the game.
     * @param lives 
     */
    public ChangeLivesCount(lives: number): void {
        if (this.InProgress)
            return Logger.Warning(`[${this.Id}] Multiplayer - Tried to change life count, but the game is already in progress.`);

        if (lives <= 0 || lives > Number.MAX_VALUE)
            return Logger.Warning(`[${this.Id}] Multiplayer - Tried to change life count, but number isn't in range: ${lives}`);

        this.Lives = lives;

        Albatross.SendToUsers(this.Players, new ServerPacketGameLivesChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Changes whether or not auto host rotation is on or off for the multiplayer game
     * @param on 
     */
    public ChangeAutoHostRotation(on: boolean): void {
        this.AutoHostRotation = on;
        
        Albatross.SendToUsers(this.Players, new ServerPacketGameHostRotationChanged(this));
        this.InformLobbyUsers();
    }

    /**
     * Calculates score for a given user
     * @param user 
     * @param judgements 
     */
    public CalculateUserScore(user: User, judgements: Judgement[]): void {
        if (!this.PlayerScoreProcessors[user.Id])
            return Logger.Warning(`[${this.Id}] Multiplayer - Failed to calculate ${user.ToNameIdString()}'s score (did not start game with them)`);

        for (let i = 0; i < judgements.length; i++)
            this.PlayerScoreProcessors[user.Id].CalculateScore(judgements[i]);
    }

    /**
     * Changes the team for a player in the game
     * @param user 
     * @param team 
     */
    public ChangeUserTeam(user: User, team: MultiplayerTeam, informLobbyUsers: boolean = true): void {
        this.RedTeamPlayers = this.RedTeamPlayers.filter(x => x != user.Id);
        this.BlueTeamPlayers = this.BlueTeamPlayers.filter(x => x != user.Id);

        switch (team) {
            case MultiplayerTeam.Red:
                this.RedTeamPlayers.push(user.Id);
                break;
            case MultiplayerTeam.Blue:
                this.BlueTeamPlayers.push(user.Id);
                break;
        }

        Logger.Info(`[${this.Id}] Multiplayer - ${user.ToNameIdString()} has been switched to the ${MultiplayerTeam[team]} team!`);

        Albatross.SendToUsers(this.Players, new ServerPacketGamePlayerTeamChanged(user, team));

        const teamChat: ChatChannel = ChatManager.Channels[this.GetTeamChatChannelName()];

        if (!teamChat.UsersInChannel.includes(user))
            user.JoinChatChannel(teamChat);

        if (informLobbyUsers)
            this.InformLobbyUsers();
    }

    /**
     * Returns the most unbalanced team in terms of player count. If they're the same, it'll
     * return red.
     */
    public GetUnbalancedOrAvailableTeam(): MultiplayerTeam {
        if (this.RedTeamPlayers.length < this.BlueTeamPlayers.length)
            return MultiplayerTeam.Red;
        else if (this.RedTeamPlayers.length > this.BlueTeamPlayers.length)
            return MultiplayerTeam.Blue;

        return MultiplayerTeam.Red;
    }

    /**
     * Get the team that a user is on
     */
    public GetUserTeam(user: User): MultiplayerTeam {
        if (this.RedTeamPlayers.includes(user.Id))
            return MultiplayerTeam.Red;
        if (this.BlueTeamPlayers.includes(user.Id))
            return MultiplayerTeam.Blue;

        return MultiplayerTeam.Red;
    }

    /**
     * Retrieves a list of users in the team
     * @param team 
     */
    public GetUsersInTeam(team: MultiplayerTeam): User[] {
        const users: User[] = [];

        switch (team) {
            case MultiplayerTeam.Red:
                this.RedTeamPlayers.forEach((x: number) => users.push(Albatross.Instance.OnlineUsers.GetUserById(x)));
                break;
            case MultiplayerTeam.Blue:
                this.BlueTeamPlayers.forEach((x: number) => users.push(Albatross.Instance.OnlineUsers.GetUserById(x)));
                break;
        }

        return users;
    }

    /**
     * Places a player on an unbalanced team in the game
     * @param user 
     */
    public PlaceUserOnUnbalancedTeam(user: User, informLobbyUsers: boolean = true): void {
        this.ChangeUserTeam(user, this.GetUnbalancedOrAvailableTeam(), informLobbyUsers);
    }

    /**
     * Changes the ruleset of the game.
     * 
     * If going from any other ruleset to teams, we need to place every player on a team,
     * otherwise clear the teams
     * @param ruleset 
     */
    public ChangeRuleset(ruleset: MultiplayerGameRuleset): void {
        if (ruleset == this.Ruleset)
            return;

        this.Ruleset = ruleset;

        // Clear all teams to start off with
        this.RedTeamPlayers = [];
        this.BlueTeamPlayers = [];

        // Send packet first to all players in the current game that the ruleset has changed, so they're
        // aware of if the game is team based or not
        Albatross.SendToUsers(this.Players, new ServerPacketGameRulesetChanged(this));

        switch (this.Ruleset) {
            // Moving to teams, so populate each team with players
            case MultiplayerGameRuleset.Team:
                for (let i = 0; i < this.Players.length; i++) {
                    let team: MultiplayerTeam = (i < this.Players.length / 2) ? MultiplayerTeam.Red : MultiplayerTeam.Blue;
                    this.ChangeUserTeam(this.Players[i], team, false);
                }
                break;
            case MultiplayerGameRuleset.Free_For_All:
                for (let i = 0; i < this.Players.length; i++)
                    this.Players[i].LeaveChatChannel(ChatManager.Channels[this.GetTeamChatChannelName()]);
                break;
        }

        this.InformLobbyUsers();
    }

    /**
     *  
     */
    private ClearAndPopulateScoreProcessors(): void {
        this.PlayerScoreProcessors = {};
        
        for (let i = 0; i < this.PlayersGameStartedWith.length; i++) {
            let mods = parseInt(this.Modifiers);
            const playerMods = this.PlayerMods.find(x => x.Id == this.PlayersGameStartedWith[i].Id);

            if (playerMods)
                mods |= parseInt(playerMods.Mods);

            this.PlayerScoreProcessors[this.PlayersGameStartedWith[i].Id] = new ScoreProcessorKeys(mods, new ScoreProcessorMultiplayer(this.HealthType, this.Lives));
        }
    }
}