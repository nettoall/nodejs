//  프로그램 실행시 argument를 주면 같이 붙음 
// ex: node console.js 1 temp 
var args = process.argv;
// 프로그램 실행하면서 기본적으로 받는 입력 값 
console.log(args);
console.log('A');
console.log('B');
// false로 빠지는 경우가 없으므로 C2 출력 
if (args[2] == '1') {
    console.log('C1');
} else {
    console.log('C2');
}
console.log('D');