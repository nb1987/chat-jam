import localforage from "localforage";

localforage.config({
  name: "chatJam", // 데이터베이스 이름
  storeName: "localMessages", // 저장소 이름, IndexedDB object store 이름
  description: "Pending chat messages",
});

export default localforage;
