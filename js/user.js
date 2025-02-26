function registerUser() {
    

    let username = document.getElementById("username").value.trim();
    if (!username) {
        alert("아이디를 입력하세요.");
        return;
    }

    location.href="/test/?id="+username;

    fetch('php/register_user.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("아이디 등록 완료! 검사를 진행하세요.");
            currentUsername = username;
            document.getElementById("step1").style.display = "none";
            document.getElementById("step2").style.display = "block";
        } else {
            alert("아이디 등록 실패: " + data.message);
        }
    })
    .catch(error => {
        console.error("서버 오류:", error);
        alert("서버 오류 발생");
    });

    
}