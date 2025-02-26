document.addEventListener("DOMContentLoaded", function() {
    const questions = [
        { id: 1, question: "물리학적 원리를 이해하는 것이 더 흥미롭다.", dimension: "major", type: "P" },
        { id: 2, question: "지질 구조 연구보다는 수학 문제가 더 재밌다.", dimension: "major", type: "M" },
        { id: 3, question: "나는 실험보다 이론 개념이 좋다.", dimension: "approach", type: "T" },
        { id: 4, question: "교과서 중심 학습을 선호한다.", dimension: "study_style", type: "S" },
        { id: 5, question: "나는 혼자 공부하는 게 더 효과적이다.", dimension: "group", type: "A" }
    ]; // 총 50개 질문을 이 형식으로 추가 가능

    const container = document.getElementById("questions-container");

    questions.forEach(q => {
        const div = document.createElement("div");
        div.classList.add("question");
        div.innerHTML = `<p>${q.id}. ${q.question}</p>
            <label><input type="radio" name="q${q.id}" id="qpos" value="3"> 매우 그렇다</label>
            <label><input type="radio" name="q${q.id}" id="qpos" value="2"> 그렇다</label>
            <label><input type="radio" name="q${q.id}" id="qpos" ="1"> 약간 그렇다</label>
            <label><input type="radio" name="q${q.id}" id="q" value="0"> 보통이다</label>
            <label><input type="radio" name="q${q.id}" id="qneg" value="-1"> 약간 그렇지 않다</label>
            <label><input type="radio" name="q${q.id}" id="qneg" value="-2"> 그렇지 않다.</label>
            <label><input type="radio" name="q${q.id}" id="qneg" value="-3"> 매우 그렇지 않다.</label>
        `;
        container.appendChild(div);
    });

    document.getElementById("quiz-form").addEventListener("submit", function(event) {
        event.preventDefault();
        
        let scores = { P: 0, C: 0, B: 0, G: 0, I: 0, M: 0, E: 0, T: 0, S: 0, R: 0, A: 0, U: 0 };

        questions.forEach(q => {
            let selected = document.querySelector(`input[name="q${q.id}"]:checked`);
            if (selected) {
                scores[q.type] += parseInt(selected.value);
            }
        });

        fetch('php/process.php', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scores)
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = `/result?type=${data.user_type}`;
        });
    });
});
