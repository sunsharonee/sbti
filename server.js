var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var qs = require('querystring');

const DATA_FILE = path.join(__dirname, 'data', 'questions.json');

var sbti_data={};
var questions={};
const totalQuestions=48;

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var body = '';
    

    if(_url === '/'){
      _url = '/index.html';
    }
    if(_url === '/login'){
      _url = '/test.html';
    }
    if(_url === '/about'){
      _url = '/about.html';
    }
    if(_url === `/test?id=${queryData.id}&num=${queryData.num}`){
      request.on('data', function (data) {
        body = body + data;
        var check = qs.parse(body);
        Object.assign(sbti_data,check);
        console.log(sbti_data);
      });
      request.on('end', function () {
        fs.readFile(DATA_FILE,'utf-8',function(err,question){

          questions = JSON.parse(question);
          console.log(questions);
          var num = parseInt(queryData.num) || 1;
          const pageSize = 5;
          const startIndex = (num - 1) * pageSize;
          const selectedQuestions = questions.slice(startIndex, startIndex + pageSize);
          num++;
          console.log(num);

          if(num < 11){
            var query = `/test?id=${queryData.id}&num=${num}`;
            var button = '다음으로';
          }else{
            var query = `/result`;
            var button = '결과 보기';
          }

          console.log(query);


          console.log(questions);
          console.log(sbti_data);

          //if(num < ) // 총 문제 사이즈 넣기/...
          var template=`<!DOCTYPE html>
          <html lang="ko">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>StudyBTI</title>
              <link rel="icon" type="image/x-icon" href="/images/SBTI2.png">
              <link rel="stylesheet" href="/css/index_styles.css">

              <style>
                  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR&display=swap');
              </style> 

              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
          </head>
          <body>
              <div class="container">
                  <a href="/" target="_blank">
                      <img src="/images/SBTI.png" width=120px height=120px align="left"/>
                  </a>
                  
                  <br>
                  <h1 style="margin-bottom:50px">공부 유형 MBTI 검사</h1>
                    <br><br>
                      <form id=quiz-form action="${query}" method="POST">
                        <div id="questions-container">
                          ${selectedQuestions.map(q => `
                            <p>${q.id}. ${q.question}</p>
                            <p>
                              <label><input type="radio" name="q${q.id}" value="3"> 매우 그렇다</label>
                              <label><input type="radio" name="q${q.id}" value="2"> 그렇다</label>
                              <label><input type="radio" name="q${q.id}" value="1"> 약간 그렇다</label>
                              <label><input type="radio" name="q${q.id}" value="0"> 보통이다</label>
                              <label><input type="radio" name="q${q.id}" value="-1"> 약간 그렇지 않다</label>
                              <label><input type="radio" name="q${q.id}" value="-2"> 그렇지 않다.</label>
                              <label><input type="radio" name="q${q.id}" value="-3"> 매우 그렇지 않다.</label>
                            </p>
                            <br>
                          `).join("")}
                        </div>
                        <button type="submit">${button}</button>
                      </form>

              </div>
              <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

          </body>
          </html>
          `
          
          response.end(template);
          return;
        });
      });      
    }
    if (_url === `/result`) {

      const majorNames = {
        P: "물리(P)",
        C: "화학(C)",
        B: "생물(B)",
        G: "지구과학(G)",
        I: "정보(I)",
        M: "수학(M)"
      };
      // MBTI 점수를 저장할 객체
      let scores = { P: 0, C: 0, B: 0, G: 0, I: 0, M: 0, E: 0, T: 0, S: 0, R: 0, A: 0, U: 0 };
  
      // 사용자의 응답을 기반으로 점수 계산
      for (let key in sbti_data) {
          let value = parseInt(sbti_data[key]); // 선택된 점수
          let question = questions.find(q => `q${q.id}` === key); // 해당 질문 찾기
          if (question) {
              scores[question.type] += value; // 해당 유형에 점수 추가
          }
      }
  
      // 총 점수 계산
      let totalMajorScore = ["P", "C", "B", "G", "I", "M"].reduce((sum, type) => sum + scores[type], 0);
      let totalApproachScore = scores["E"] + scores["T"];
      let totalStudyStyleScore = scores["S"] + scores["R"];
      let totalGroupScore = scores["A"] + scores["U"];
  
      // 유형별 가장 높은 점수를 받은 것 선택
      let major = ["P", "C", "B", "G", "I", "M"].reduce((a, b) => (scores[a] > scores[b] ? a : b));
      let approach = scores["E"] > scores["T"] ? "E" : "T";
      let study_style = scores["S"] > scores["R"] ? "S" : "R";
      let group = scores["A"] > scores["U"] ? "A" : "U";
  
      // 최종 4글자 MBTI 유형 결정
      let mbti_result = `${major}${approach}${study_style}${group}`;
  
      // 결과 HTML 페이지 생성
      var resultPage = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>결과 - StudyBTI</title>
          <link rel="icon" type="image/x-icon" href="/images/SBTI2.png">
          <link rel="stylesheet" href="/css/index_styles.css">
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR&display=swap');
              .result-container { text-align: center; padding: 50px; }
              .result-box { font-size: 36px; font-weight: bold; color: #007bff; }
              .description { margin-top: 20px; font-size: 18px; }
              .chart-container { width: 80%; margin: 30px auto; }
          </style>
      </head>
      <body>
          <div class="container result-container">
              <h1>당신의 공부 유형 MBTI 결과</h1>
              <div class="result-box">${mbti_result}</div>
              <div class="description">
                  <p>당신의 학습 성향은 <b>${majorNames[major]}</b> 전공에 적합하며,</p>
                  <p><b>${approach === "E" ? "실험 중심" : "이론 중심"}</b> 접근을 선호하고,</p>
                  <p><b>${study_style === "S" ? "교과서 기반 학습" : "탐구형 학습"}</b>을 더 좋아하며,</p>
                  <p><b>${group === "A" ? "혼자 공부" : "여러 사람과 함께 공부"}</b>하는 것이 더 효과적입니다.</p>
              </div>
  
              <!-- 📊 육각형 차트 (전공 분야) -->
              <div class="chart-container">
                  <h3>📌 전공 분야 점수 분포</h3>
                  <canvas id="majorChart"></canvas>
              </div>
  
              <!-- 📊 막대 차트 (나머지 항목) -->
              <div class="chart-container">
                  <h3>📌 기타 학습 성향</h3>
                  <canvas id="studyChart"></canvas>
              </div>
  
              <br>
              <a href="/" class="btn btn-primary">다시 테스트하기</a>
          </div>
  
          <script>
              // 전공 점수 퍼센트 변환
              let majorScores = {
                  P: ${(scores["P"] / totalMajorScore * 100).toFixed(1)},
                  C: ${(scores["C"] / totalMajorScore * 100).toFixed(1)},
                  B: ${(scores["B"] / totalMajorScore * 100).toFixed(1)},
                  G: ${(scores["G"] / totalMajorScore * 100).toFixed(1)},
                  I: ${(scores["I"] / totalMajorScore * 100).toFixed(1)},
                  M: ${(scores["M"] / totalMajorScore * 100).toFixed(1)}
              };
  
              let ctxMajor = document.getElementById('majorChart').getContext('2d');
              new Chart(ctxMajor, {
                  type: 'radar',
                  data: {
                      labels: ["P (물리)", "C (화학)", "B (생물)", "G (지구과학)", "I (정보)", "M (수학)"],
                      datasets: [{
                          label: "전공 점수 (%)",
                          data: [majorScores.P, majorScores.C, majorScores.B, majorScores.G, majorScores.I, majorScores.M],
                          backgroundColor: "rgba(0, 123, 255, 0.2)",
                          borderColor: "rgba(0, 123, 255, 1)",
                          borderWidth: 2
                      }]
                  },
                  options: {
                      responsive: true,
                      scale: { ticks: { beginAtZero: true, max: 100 } }
                  }
              });
  
              // 학습 성향 점수 퍼센트 변환
              let approachPercent = ${(scores["E"] / totalApproachScore * 100).toFixed(1)};
              let studyStylePercent = ${(scores["S"] / totalStudyStyleScore * 100).toFixed(1)};
              let groupPercent = ${(scores["A"] / totalGroupScore * 100).toFixed(1)};
  
              let ctxStudy = document.getElementById('studyChart').getContext('2d');
            new Chart(ctxStudy, {
                type: 'bar',
                data: {
                    labels: ["실험 ↔ 이론", "교과서 ↔ 탐구", "혼자 ↔ 여럿"],
                    datasets: [{
                        label: "학습 성향 (%)",
                        data: [-approachPercent, studyStylePercent, -groupPercent], 
                        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"], // 왼쪽(음수) 색상
                        borderColor: ["#ff6384", "#36a2eb", "#ffce56"],
                        borderWidth: 1
                    },
                    {
                        label: "반대 성향 (%)",
                        data: [100 - approachPercent, -(100 - studyStylePercent), 100 - groupPercent], 
                        backgroundColor: ["#ff99a0", "#99c2ff", "#ffe599"], // 오른쪽(양수) 색상
                        borderColor: ["#ff99a0", "#99c2ff", "#ffe599"],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    indexAxis: 'y', // 가로 막대 그래프로 설정
                    scales: {
                        x: {
                            min: -100, // 범위를 -100에서 100으로 설정
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    if (value === -100) return "실험 / 교과서 / 혼자";
                                    if (value === 100) return "이론 / 탐구 / 여럿";
                                    return value;
                                }
                            }
                        },
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    let label = tooltipItem.dataset.label || '';
                                    let value = tooltipItem.raw;
                                    let category = tooltipItem.label;
                                    let side = value < 0 ? "왼쪽 (실험/교과서/혼자)" : "오른쪽 (이론/탐구/여럿)";
                                    return category + ": " + Math.abs(value) + "%" + (value !== 0 ? " (" + side + ")" : "");
                                }
                            }
                        }
                    }
                }
            });
          </script>
      </body>
      </html>
      `;
  
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(resultPage);
    }
  
  

    if(request.url == '/favicon.ico'){
      response.writeHead(404);
      response.end();
      return;
    }
    

    if(_url !=  `/test?id=${queryData.id}&num=${queryData.num}`){
      response.writeHead(200);
      response.end(fs.readFileSync(__dirname + _url));
    }

});
app.listen(80);