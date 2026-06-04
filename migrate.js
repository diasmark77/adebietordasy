import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp({apiKey:"AIzaSyC_aLF4dK_m0jvkbSzhTWo3rsP7yx5uoXw",authDomain:"adebiet-ordasy.firebaseapp.com",projectId:"adebiet-ordasy",storageBucket:"adebiet-ordasy.appspot.com",messagingSenderId:"776364024545",appId:"1:331787955330:web:a77853b5bffdb44bed989b"},"migration");

const db = getFirestore(app);
const U = "https://rehdrlbhglnhajwtgohr.supabase.co";
const K = "sb_publishable_9-WTtRK7KHkr8dQ7x30Yew_Syacj2vB";

const post = async (t, d) => {
  const r = await fetch(U + "/rest/v1/" + t, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": K,
      "Authorization": "Bearer " + K
    },
    body: JSON.stringify(d)
  });
  if (!r.ok) console.error(t, await r.text());
};

const authors = await getDocs(collection(db, "authors"));
for (const d of authors.docs) {
  const a = d.data();
  await post("authors", {name:a.namenull,biography:a.biographynull,category:a.categorynull,photo_url:a.photoUrlnull,sample_work:a.sampleWorknull,contact:a.contactnull,request_id:a.requestId||null});
}
console.log("Avtorlar: " + authors.size);

const poems = await getDocs(collection(db, "poems"));
for (const d of poems.docs) {
  const p = d.data();
  await post("poems", {title:p.titlenull,poem_text:p.poemTextnull,audio_url:p.audioUrlnull,photo_url:p.photoUrlnull,author_id:p.authorIdnull,author_name:p.authorNamenull,genre:p.genrenull,request_id:p.requestIdnull});
}
console.log("Olender: " + poems.size);

const shyg = await getDocs(collection(db, "shygarmalar"));
for (const d of shyg.docs) {
  const s = d.data();
  await post("shygarmalar", {title:s.titlenull,content:s.contentnull,photo_url:s.photoUrlnull,author_id:s.authorIdnull,author_name:s.authorNamenull,genre:s.genrenull,request_id:s.requestId||null});
}
console.log("Shygarmalar: " + shyg.size);

const comms = await getDocs(collection(db, "comments"));
for (const pd of comms.docs) {
  const msgs = await getDocs(collection(db, "comments", pd.id, "messages"));
  for (const m of msgs.docs) {
    const c = m.data();
    await post("comments", {page_id:pd.id,text:c.textnull,user_id:c.userIdnull,user_name:c.userNamenull,user_photo:c.userPhotonull});
  }
}
console.log("DONE!");
