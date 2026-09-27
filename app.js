const $=id=>document.getElementById(id);
$("gen").onclick=async()=>{
 const url=$("url").value.trim();
 if(!url)return $("status").textContent="पहले YouTube link डालें।";
 $("gen").disabled=true;$("status").textContent="⏳ Transcript पढ़कर AI notes बना रहा है...";
 try{
  const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,language:$("language").value,noteType:$("type").value})});
  const d=await r.json();if(!r.ok)throw Error(d.error);
  $("notes").value=d.notes;$("out").classList.remove("hidden");$("status").textContent="✅ Notes तैयार हैं।";
 }catch(e){$("status").textContent="❌ "+e.message}
 $("gen").disabled=false;
};
$("pdf").onclick=async()=>{
 $("status").textContent="⏳ A4 PDF बना रहा है...";
 const r=await fetch("/api/pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({notes:$("notes").value,language:$("language").value})});
 if(!r.ok){$("status").textContent="❌ PDF नहीं बन पाया।";return}
 const b=await r.blob(),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="youtube-notes-A4.pdf";a.click();URL.revokeObjectURL(a.href);
 $("status").textContent="✅ PDF download हो गया।";
};
$("copy").onclick=async()=>{await navigator.clipboard.writeText($("notes").value);$("status").textContent="✅ Notes copied."};
