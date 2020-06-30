

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
  
  