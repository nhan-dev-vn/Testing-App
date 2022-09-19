module.exports = {
  areSameIds: (id1, id2) => {
    if (id1 && id1.equals) {
      return id1.equals(id2);
    }
    if (id2 && id2.equals) {
      return id2.equals(id1);
    }
    return id1 === id2;
  }
}