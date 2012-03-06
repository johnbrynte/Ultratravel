
//document.write("<h2>"+flight()+"</h2>");

function main() {

}

/** Returns the whole shit as an object */
function createRandomFlight() {
    return flight = {
        airline: airline(),
        aircraft: aircraft(),
        price: price(),
        time: timesObject()
    };
}

/** Returns the whole shit as a string */
function flight(){
    var fTimes = times();
    var fAirline = airline();
    var fCraft = aircraft();
    var fPrice = price();

    var alles = "Time: " + fTimes + "<br>Airline: " + fAirline + "<br>Aircraft: " + fCraft + "<br>Price: " + fPrice +":-";
    return alles;
}

/** Returns a random start and end time as a string */
function times() {
    var hs = Math.floor(Math.random()*24);
    if(hs < 10) hs = "0"+hs;
    var ms = Math.floor(Math.random()*60);
    if(ms < 10) ms = "0"+ms;
    var he = (hs + Math.floor(Math.random()*16+1))%24;
    if(he < 10) he = "0"+he;
    var me = (ms + Math.floor(Math.random()*60+1))%60;
    if(me < 10) me = "0"+me;

    return hs + ":" + ms + "-" + he + ":" + me;
}

/** Returns a random start and end time as an object */
function timesObject() {
    var hs = Math.floor(Math.random()*24);
    if(hs < 10) hs = "0"+hs;
    var ms = Math.floor(Math.random()*60);
    if(ms < 10) ms = "0"+ms;
    var he = (hs + Math.floor(Math.random()*16+1))%24;
    if(he < 10) he = "0"+he;
    var me = (ms + Math.floor(Math.random()*60+1))%60;
    if(me < 10) me = "0"+me;

    return {
        start: {
            h: hs,
            m: ms
        },
        end: {
            h: he,
            m: me
        }
    };
}

/** Returns airline string */
function airline(){
    var parts1 = ["Ultra", "Super", "Business", "Michailo", "Balkan", "Cheap-o-rama", "Electro", "Hindenburg"];
    var parts2 = [" Air", " Travel", "-flyzzle", " Travels", " Superflights", " Heavenly Airtime", " Cloudsky", " Airlines", " Heaven", " Inc.", " & C:o"];

    var part1 = parts1[Math.floor(Math.random()*parts1.length)];
    var part2 = parts2[Math.floor(Math.random()*parts2.length)];
    var bizniz = part1 + part2;

    return bizniz;
}

/** returns an aircraft string */
function aircraft(){
    var crafts =
	["ATR 42",
	 "ATR 72",
	 "Airbus A300",
	 "Airbus A310",
	 "Airbus A318",
	 "Airbus A319",
	 "Airbus A320",
	 "Airbus A321",
	 "Airbus A330",
	 "Airbus A340",
	 "Airbus A380",
	 "Airbus A350",
	 "British Aerospace BAe 146",
	 "Boeing 757",
	 "Boeing 767",
	 "Boeing 777",
	 "Boeing 787",
	 "Bombardier CRJ-100",
	 "Bombardier CRJ-200",
	 "Bombardier CRJ-700",
	 "Bombardier CRJ-900",
	 "Bombardier Dash 8",
	 "Bombardier CS100",
	 "Bombardier CS300",
	 "CASA C-212 Aviocar",
	 "Comac C919",
	 "Embraer EMB 121 Xingu",
	 "Embraer EMB 120 Brasilia",
	 "Embraer/FMA CBA 123 Vector",
	 "Embraer ERJ 135",
	 "Embraer ERJ 140",
	 "Embraer ERJ 145",
	 "Embraer 170",
	 "Embraer 175",
	 "Embraer 190",
	 "Embraer 195",
	 "Fokker 50",
	 "Fokker 70",
	 "Fokker 100",
	 "Irkut MS-21",
	 "Ilyushin Il-86",
	 "Ilyushin Il-96",
	 "McDonnell-Douglas MD-11",
	 "McDonnell Douglas MD-80",
	 "McDonnell Douglas MD-90",
	 "McDonnell-Douglas MD-95",
	 "Sukhoi Superjet 100",
	 "Tupolev Tu-204"];

    return crafts[Math.floor(Math.random()*crafts.length)];
}

/** Returns the price as a String */
function price(){
    return Math.floor(Math.random()*7000+200);
}
