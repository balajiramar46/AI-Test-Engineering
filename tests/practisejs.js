function findpair(arr,target){
let seen=new Set();
let result=[];
for(let n of arr){
    
        let compliment=target-n;
    

if(seen.has(compliment)){
    result.push([compliment,n]);

}
seen.add(n);
}
return result;
}
,
i/p=([1,2,4,5],3)
open(1,2)
arr,tat
fucntion 
let seen

