function countcharfre(arr){
    let map=new Map();
    for(let ch of arr){
        if(map.has(ch)){
            map.set(ch,map.get(ch)+1);
        }else{
            map.set(ch,1);
        }
    }
    return map;

}
console.log(countcharfre([2,43,42,2,1,1]));