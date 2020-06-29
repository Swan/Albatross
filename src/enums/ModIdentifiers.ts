enum ModIdentifiers {
    None = -1,
    NoSliderVelocity = 1 << 0, // No Slider Velocity
    Speed05X = 1 << 1, // Speed 0.5x,
    Speed06X = 1 << 2, // Speed 0.6x
    Speed07X = 1 << 3, // Speed 0.7x
    Speed08X = 1 << 4, // Speed 0.8x
    Speed09X = 1 << 5, // Speed 0.9x
    Speed11X = 1 << 6, // Speed 1.1x
    Speed12X = 1 << 7, // Speed 1.2x
    Speed13X = 1 << 8, // Speed 1.3x
    Speed14X = 1 << 9, // Speed 1.4x
    Speed15X = 1 << 10, // Speed 1.5x
    Speed16X = 1 << 11, // Speed 1.6x
    Speed17X = 1 << 12, // Speed 1.7x
    Speed18X = 1 << 13, // Speed 1.8x
    Speed19X = 1 << 14, // Speed 1.9x
    Speed20X = 1 << 15, // Speed 2.0x
    Strict = 1 << 16, // Makes the accuracy hit windows harder
    Chill = 1 << 17, // Makes the accuracy hit windows easier
    NoPause = 1 << 18, // Disallows pausing.
    Autoplay = 1 << 19, // The game automatically plays it.
    Paused = 1 << 20, // The user paused during gameplay.
    NoFail = 1 << 21, // Unable to fail during gameplay.
    NoLongNotes = 1 << 22, // Converts LNs into regular notes.
    Randomize = 1 << 23, // Swaps up the lanes of the map. 
    Speed055X = 1 << 24, // Speed 0.55x,
    Speed065X = 1 << 25, // Speed 0.65x
    Speed075X = 1 << 26, // Speed 0.75x
    Speed085X = 1 << 27, // Speed 0.85x
    Speed095X = 1 << 28, // Speed 0.95x
    Inverse = 1 << 29, // Converts regular notes into LNs and vice versa.
    FullLN = 1 << 30, // Converts regular notes into LNs, keeps existing LNs.
    Mirror = (0 | 1 << 31) >>> 0, // Flips the map horizontally
    Coop = 4294967296, // Allows multiple people to play together on one client
    Speed105X = 8589934592, // Speed 1.05x
    Speed115X = 17179869184, // Speed 1.15x
    Speed125X = 34359738368, // Speed 1.25x
    Speed135X = 68719476736, // Speed 1.35x
    Speed145X = 137438953472, // Speed 1.45x
    Speed155X = 274877906944, // Speed 1.55x
    Speed165X = 549755813888, // Speed 1.65x
    Speed175X = 1099511627776, // Speed 1.75x
    Speed185X = 2199023255552, // Speed 1.85x
    Speed195X = 4398046511104, // Speed 1.95x
    HeatlthAdjust = 8796093022208 // Test mod for making long note windows easier
}

export default ModIdentifiers;
