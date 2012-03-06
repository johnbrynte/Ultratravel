
/** Returns the whole shit as an object */
function createRandomHotel() {
    return {
        hotel: hotel(),
        address: address(),
        price: price(),
    };
}

/** Returns the whole shit as a string */
function hotelStay(hotelStay) {
    return "<p>Hotell: " + hotelStay.hotel + "<br />Adress: " + hotelStay.address + "<br />Pris: <b>"+hotelStay.price +":-</b></p>";
}

/** Returns hotel name string */
function hotel() {
    var parts1 = ["Ultra", "Super", "Business", "Michailo", "Balkan", "Cheap-o-rama", "Electro", "Hindenburg", "Fluffy", "Luxurious", "High Standard Super Fine", "Hilton", "Bedtime"];
    var parts2 = [" Hotels", " Hotel", " Living", "-Sleepers", " Bedbugs O'Hoy", " Sleepypants", " Sleeping Beauties", " Comfort", " Fluffy Clouds", " Standards Inc.", " & C:o", " & Family", " and Sons", " Resort"];

    return parts1[Math.floor(Math.random()*parts1.length)] + parts2[Math.floor(Math.random()*parts2.length)];
}

/** Returns the address asa astrgin */
function address() {
    var name = ["John", "Daniel", "Anton", "Viktor", "Alexander", "Turesson", "Molin", "Erholt", "Gavelli", "Gomez", "Free the People", "Lady Gaga", "Business", "Coffee", "Destruction", "Llama", "Angst", "Giraffe", "Sausage", "Pong", "Pfefferjackst Schültzhabend", "Addiction", "Razorsharp Cuts", "Blast from the Past", "The"];

    var suff = [" Street", " Road", " Plaza", " Avenue", " Alley", " Hills", " Valley", " Lane", " Way", " Square"];

    var number = Math.floor(Math.random()*200+1);

    return  name[Math.floor(Math.random()*name.length)] +
            suff[Math.floor(Math.random()*suff.length)] + " " + number;
}

/** Returns the price as a String */
function price() {
    return Math.floor(Math.random()*7000+200);
}
