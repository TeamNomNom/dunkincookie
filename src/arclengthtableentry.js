class ArclengthtableEntry {
    constructor(x, y, arclength, totalengthtillprev)
    {
        this.x = x;
        this.y = y;
        this.arclength = 0;
        this.totalLengthTillHere = totalengthtillprev + arclength;
    }
}