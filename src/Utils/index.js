

// Implementation of Fisher–Yates shuffle to randomise an array
export function shuffle(a) {
    var i, j, x;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }
  

export function getID(numberOfCharacters) {
    // Alphanumeric characters
    const chars =
       // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
       // 'abcdefghijklmnopqrstuvwxyz0123456789';
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
       let id = '';
    for (let i = 0; i < numberOfCharacters; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
}
  

export function getSmartAgeFromMs(timeMs, shortUnits) {
    if (!timeMs) {
        return 'n/a';
    }

    const suffix = ' ago';
    
    let days = Math.floor(timeMs / 1000 / 60 / 60 / 24);
    if (days >= 1) {
        return days + (shortUnits ? 'd' : ' day' + (days > 1 ? 's' : '') + suffix);
    } 
    
    let hours = Math.floor(timeMs / 1000 / 60 / 60);
    if (hours >= 1) {
        return hours + (shortUnits ? 'h' : ' hour' + (hours > 1 ? 's' : '') + suffix);
    }
    
    let minutes = Math.floor(timeMs / 1000 / 60);
    if (minutes >= 1) {
        return minutes + (shortUnits ? 'm' : ' minute' + (minutes > 1 ? 's' : '') + suffix);
    }
    
    let seconds = Math.floor(timeMs / 1000);
    if (seconds >= 3) {
        return seconds + (shortUnits ? 's' : ' second' + (seconds > 1 ? 's' : '') + suffix);
    }
    
    return (shortUnits ? 'now' : ' just a moment' + suffix);
}
  
  