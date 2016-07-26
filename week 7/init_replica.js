config = {
  _id: "m101", members:
  [
    { _id : 0, host : "localhost:27017", priority:0, slaveDelay:5 },
    { _id : 1, host : "localhost:27018" },
    { _id : 2, host : "localhost:27019" }
  ]
};

rs.initiate(config);
rs.status();

/*
  read in this config script

  mongo --port 27018 < init_replica.js

  note: can't initilise a replica from a host that can't become primary so 27018
  is used.
*/
