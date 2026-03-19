import"../chunks/DsnmJJEf.js";import{aj as g,a0 as v,a1 as d,a2 as U,t as j,L as h,ak as L,_ as N,G as F,$,a5 as X,O as I,aI as ae,ap as R,be as re,M as oe}from"../chunks/BHq5QaFd.js";import{b,f as k,c as V,t as se}from"../chunks/CzLmae73.js";import{b as S,g as ie,f as G}from"../chunks/B-EcIxLo.js";import{e as W,i as Y,c as le,d as ce}from"../chunks/Ba50pWiT.js";import{e as ue}from"../chunks/llq3-YZR.js";import{c as me,b as he,i as pe}from"../chunks/Di9gwBeW.js";import{s as de,p as q}from"../chunks/DtK74uso.js";import{s as ee}from"../chunks/B9yPAbJr.js";import{C as ve,c as fe}from"../chunks/CJ5lpwqs.js";import{b as ge}from"../chunks/tfv7RY-J.js";import"../chunks/Cock485a.js";var Q={},z={},H=34,P=10,J=13;function te(t){return new Function("d","return {"+t.map(function(n,a){return JSON.stringify(n)+": d["+a+'] || ""'}).join(",")+"}")}function ye(t,n){var a=te(t);return function(r,o){return n(a(r),o,t)}}function K(t){var n=Object.create(null),a=[];return t.forEach(function(r){for(var o in r)o in n||a.push(n[o]=o)}),a}function T(t,n){var a=t+"",r=a.length;return r<n?new Array(n-r+1).join(0)+a:a}function we(t){return t<0?"-"+T(-t,6):t>9999?"+"+T(t,6):T(t,4)}function be(t){var n=t.getUTCHours(),a=t.getUTCMinutes(),r=t.getUTCSeconds(),o=t.getUTCMilliseconds();return isNaN(t)?"Invalid Date":we(t.getUTCFullYear())+"-"+T(t.getUTCMonth()+1,2)+"-"+T(t.getUTCDate(),2)+(o?"T"+T(n,2)+":"+T(a,2)+":"+T(r,2)+"."+T(o,3)+"Z":r?"T"+T(n,2)+":"+T(a,2)+":"+T(r,2)+"Z":a||n?"T"+T(n,2)+":"+T(a,2)+"Z":"")}function xe(t){var n=new RegExp('["'+t+`
\r]`),a=t.charCodeAt(0);function r(e,c){var x,w,m=o(e,function(D,f){if(x)return x(D,f-1);w=D,x=c?ye(D,c):te(D)});return m.columns=w||[],m}function o(e,c){var x=[],w=e.length,m=0,D=0,f,_=w<=0,C=!1;e.charCodeAt(w-1)===P&&--w,e.charCodeAt(w-1)===J&&--w;function O(){if(_)return z;if(C)return C=!1,Q;var M,B=m,A;if(e.charCodeAt(B)===H){for(;m++<w&&e.charCodeAt(m)!==H||e.charCodeAt(++m)===H;);return(M=m)>=w?_=!0:(A=e.charCodeAt(m++))===P?C=!0:A===J&&(C=!0,e.charCodeAt(m)===P&&++m),e.slice(B+1,M-1).replace(/""/g,'"')}for(;m<w;){if((A=e.charCodeAt(M=m++))===P)C=!0;else if(A===J)C=!0,e.charCodeAt(m)===P&&++m;else if(A!==a)continue;return e.slice(B,M)}return _=!0,e.slice(B,w)}for(;(f=O())!==z;){for(var E=[];f!==Q&&f!==z;)E.push(f),f=O();c&&(E=c(E,D++))==null||x.push(E)}return x}function l(e,c){return e.map(function(x){return c.map(function(w){return i(x[w])}).join(t)})}function u(e,c){return c==null&&(c=K(e)),[c.map(i).join(t)].concat(l(e,c)).join(`
`)}function p(e,c){return c==null&&(c=K(e)),l(e,c).join(`
`)}function y(e){return e.map(s).join(`
`)}function s(e){return e.map(i).join(t)}function i(e){return e==null?"":e instanceof Date?be(e):n.test(e+="")?'"'+e.replace(/"/g,'""')+'"':e}return{parse:r,parseRows:o,format:u,formatBody:p,formatRows:y,formatRow:s,formatValue:i}}var ke=xe(","),_e=ke.parse,Ce=k('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function Te(t){var n=Ce();b(t,n)}var Se=k('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function De(t){var n=Se();b(t,n)}var je=k('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function Ie(t){const n=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var a=je(),r=g(v(a),2);W(r,17,()=>n,Y,(o,l)=>{let u=()=>h(l).tag,p=()=>h(l).text;var y=V(),s=U(y);ue(s,u,!1,(i,e)=>{var c=se();j(()=>S(c,p())),b(e,c)}),b(o,y)}),d(a),b(t,a)}var Ae=k("<p> </p>");function qe(t,n){var a=Ae(),r=v(a);d(a),j(()=>S(r,`I am component A and my favorite number is ${n.number??""}.`)),b(t,a)}var Re=k("<p> </p>");function Oe(t,n){var a=Re(),r=v(a);d(a),j(()=>S(r,`I am component B and my name is ${n.name??""}.`)),b(t,a)}var Ee=k('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function Me(t){const n={A:qe,B:Oe},a=[{component:"A",number:42},{component:"B",name:"Russell"}];var r=Ee(),o=g(v(r),2);W(o,17,()=>a,Y,(l,u)=>{const p=L(()=>n[h(u).component]);var y=V(),s=U(y);me(s,()=>h(p),(i,e)=>{e(i,de(()=>h(u)))}),b(l,y)}),d(r),b(t,r)}var Be=k("<div><!></div>");function Ue(t,n){N(n,!0);let a=q(n,"root",3,null),r=q(n,"top",3,0),o=q(n,"bottom",3,0),l=q(n,"increments",3,100),u=q(n,"value",15,void 0),p=[],y=[],s=[],i=[],e;function c(){let f=0,_=0;for(let C=0;C<p.length;C++)p[C]>f&&(f=p[C],_=C);f>0?u(_):u(void 0)}function x(f,_){const C=Z=>{Z[0].isIntersecting;const ne=Z[0].intersectionRatio;p[_]=ne,c()},O=r()?r()*-1:0,E=o()?o()*-1:0,M=`${O}px 0px ${E}px 0px`,B={root:a(),rootMargin:M,threshold:y};i[_]&&i[_].disconnect();const A=new IntersectionObserver(C,B);A.observe(f),i[_]=A}function w(){s.length&&s.forEach(x)}F(()=>{for(let f=0;f<l()+1;f++)y.push(f/l());s=e.querySelectorAll(":scope > *:not(iframe)"),w()}),F(()=>{r(),o(),w()});var m=Be(),D=v(m);ee(D,()=>n.children??X),d(m),he(m,f=>e=f,()=>e),b(t,m),$()}var Pe=k('<div><p class="svelte-1sxgmm9"> </p></div>'),Fe=k('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function Le(t){let n=R(void 0);var a=Fe(),r=v(a),o=g(v(r)),l=v(o,!0);d(o),d(r);var u=g(r,4);Ue(u,{get value(){return h(n)},set value(p){I(n,p,!0)},children:(p,y)=>{var s=V(),i=U(s);W(i,16,()=>[0,1,2,3,4],Y,(e,c,x)=>{const w=L(()=>h(n)===x);var m=Pe();let D;var f=v(m),_=v(f,!0);d(f),d(m),j(()=>{D=le(m,1,"step svelte-1sxgmm9",null,D,{active:h(w)}),S(_,c)}),b(e,m)}),b(p,s)},$$slots:{default:!0}}),ae(2),d(a),j(()=>S(l,h(n)||"-")),b(t,a)}const Ne=`{
  "title": "Mow this lawn. Learn about your brain.",
  "description": "Your lawn mowing style says more about you than you think.",
  "byline": "By <a href=https://pudding.cool/author/russell-samora target=_blank rel=noreferrer>Russell Samora</a>",
  "body": [
    {
      "section": "intro",
      "content": [
        {
          "type": "text",
          "value": "This is a story about how our minds work. But first, let’s start with a game: <strong>how efficiently can you mow this lawn?</strong>"
        }
      ]
    },
    {
      "section": "Game"
    },
    {
      "section": "post",
      "content": [
        {
          "type": "text",
          "value": "So far, <strong class=field>X</strong> other people have mowed this lawn. <span class=you>Your technique was better than <strong class=percent-vs-field>X%</strong> of them. <strong class=custom-field></strong></span>"
        },
        {
          "type": "text",
          "value": "If we strip away the grass, mowing is really just a path of connected nodes. <span class=you>You were <strong class=percent-vs-optimal>X%</strong> less efficient than the optimal path, which looks like this:</span><span class=skip>The optimal path looks like this (TODO):</span>"
        },
        {
          "type": "Result",
          "value": {}
        },
        {
          "type": "text",
          "value": "Finding the best path through the nodes is a classic computer science problem. No, don’t leave! I promise this won’t get too wonky. All you need to know is that there are two main ways to tackle a problem like this:"
        },
        {
          "type": "ul",
          "value": {
            "li": [
              "<strong>algorithms</strong> which calculate the optimal path and",
              "<strong>heuristics</strong> which are simple strategies to complete the path"
            ]
          }
        },
        {
          "type": "text",
          "value": "Humans tend to operate like heuristics, and based on your path, you mow most like a __."
        },
        {
          "type": "text",
          "value": "<mark>Reader’s path vs their matching heuristic</mark>"
        },
        {
          "type": "text",
          "value": "This isn’t a perfect label though, we used some fancy calculations to find the closest match. You can read more about it in the <a href=#>method section</a>. Your detailed heuristic classification breakdown looks like this:"
        },
        {
          "type": "text",
          "value": "<mark>small bar chart of similarity scores across all heuristics</mark>"
        },
        {
          "type": "text",
          "value": "There are many strategies for a problem like mowing the lawn, which is technically known as <strong>Coverage Path Planning</strong>. Here are some common techniques:"
        },
        {
          "type": "text",
          "value": "<mark>small multiple grid of all heuristics</mark>"
        },
        {
          "type": "text",
          "value": "On an open grid with few obstacles, most of these techniques (and those performed by other readers) performed almost identically."
        },
        {
          "type": "text",
          "value": "<mark>bar chart/table of their efficiency scores and how many users fell into each.</mark>"
        },
        {
          "type": "text",
          "value": "The differences only start to become apparent when things get more complicated. On a small, simple grid your approach doesn’t matter much. But what happens when the grid gets bigger?"
        },
        {
          "type": "text",
          "value": "Is mowing not your thing? Pick something more familiar to prime your mind."
        },
        {
          "type": "text",
          "value": "<mark>reader plays a larger grid, 14x14</mark>"
        },
        {
          "type": "text",
          "value": "<mark>[their new path animated and its scoring</mark>"
        },
        {
          "type": "text",
          "value": "On the small grid you were a __. On the big grid you shifted to a __."
        },
        {
          "type": "text",
          "value": "Or"
        },
        {
          "type": "text",
          "value": "You stuck with the __ technique, even as complexity grew. That’s [common/common] like % of others."
        },
        {
          "type": "text",
          "value": "Why does this matter? When different obstacles appear, some strategies hold up better than others."
        },
        {
          "type": "text",
          "value": "<mark>slope chart of small vs. large for each heuristic</mark>"
        },
        {
          "type": "text",
          "value": "Here is how everyone performed across both grids."
        },
        {
          "type": "text",
          "value": "<mark>[slope chart again with internet and you</mark>"
        },
        {
          "type": "text",
          "value": "This is why heuristics exist. When problems get complex enough that finding the perfect answer is impractical, we fall back on good-enough strategies. So do computers."
        },
        {
          "type": "text",
          "value": "The Coverage Path Planning is related to one of the most famous problems in computer science: The Traveling Salesman Problem."
        },
        {
          "type": "video",
          "value": {
            "src": "assets/videos/tsp.mp4",
            "preload": "true",
            "autoplay": "true",
            "muted": "true",
            "loop": "true",
            "figcaption": "From <a href=https://www.youtube.com/watch?v=BAejnwN4Ccw target=_blank rel=noreferrer>The Coding Train</a> with Daniel Shiffman"
          }
        },
        {
          "type": "text",
          "value": "The premise is simple: a salesman must visit a set of cities exactly once and return to their starting point, all while taking the shortest possible route. We see this all the time in the real world. From a pizza delivery driver planning their stops to a trick-or-treater maximizing their candy haul, finding the most efficient routes would be solving a version of this problem."
        },
        {
          "type": "text",
          "value": "I wanted to create this mowing experiment after I <a href=https://docs.lib.purdue.edu/jps/vol1/iss1/4/ target=_blank rel=noreferrer>read a study</a> that found humans come impressively close to computer-calculated optimal solutions to this problem with fewer stops, and even do pretty good &mdash; just 11% less efficient than optimal &mdash; for 70+ stops. But as the stops increase, humans’ ability decreases."
        },
        {
          "type": "img",
          "value": {
            "src": "assets/images/study.png",
            "alt": "A chart depicting how people perform on the Traveling Salesman Problem compared to the optimal path, which shows that people perform near-ideal at fewer nodes, with a slow increasing deviation as more nodes are added",
            "figcaption": "Chart of findings from <a href=https://docs.lib.purdue.edu/jps/vol1/iss1/4/ target=_blank rel=noreferrer>this study</a>"
          }
        },
        {
          "type": "text",
          "value": "We’re not just good at literally connecting the dots. Our human brains are wired to go on autopilot and zip through common-sense problems like these using heuristics."
        },
        {
          "type": "text",
          "value": "Instead of calculating for optimal strategy all the time, which is easy work for a computer but certainly cognitively overwhelming for us, we draw from experience, memory, and learned patterns to form mental shortcuts. These shortcuts&mdash;like knowing to minimize overlapping when you’re mowing a lawn as quickly as possible&mdash;allow us to make quick judgments without burning through too much mental resources. This trades accuracy for speed, but since the results are usually good enough, it’s a tradeoff that’s often worth making"
        },
        {
          "type": "text",
          "value": "Why are we so good at this? Evolutionary adaptation that allows for quick judgment and decision-making when dealing with limited time, information, and cognitive resources."
        },
        {
          "type": "text",
          "value": "perceptual shortcuts"
        },
        {
          "type": "text",
          "value": "chunking"
        },
        {
          "type": "text",
          "value": "bounded rationality"
        },
        {
          "type": "text",
          "value": "<mark>can we classify the chunking on the reader’s path? or just do contrived example</mark>"
        },
        {
          "type": "text",
          "value": "But the brain has its limits. The bigger the lawn, the more data we have to process, and the heavier the cognitive load becomes"
        },
        {
          "type": "text",
          "value": "We start breaking down the grid into smaller chunks that we navigate more manageably…"
        },
        {
          "type": "text",
          "value": "Heuristics become weaker – cannot evaluate holistically"
        },
        {
          "type": "text",
          "value": "chunking"
        },
        {
          "type": "text",
          "value": "TSP scaling example"
        },
        {
          "type": "text",
          "value": "For example, brute force calculations for a salesperson visiting just 10 cities requires testing 3.6 million possible routes, and that number explodes exponentially as more cities are added."
        },
        {
          "type": "text",
          "value": "15 cities and we’re at 1.3 trillion possible routes. 😱"
        },
        {
          "type": "text",
          "value": "20 cities balloons to 2.4 quintillion possible routes. 🤯"
        },
        {
          "type": "text",
          "value": "working memory limits"
        },
        {
          "type": "text",
          "value": "<mark>visual - grids of bigger scales and how we would have to section them off?</mark>"
        },
        {
          "type": "text",
          "value": "Even algorithms struggle. Here's how each heuristic performed across 100 random layouts.”"
        },
        {
          "type": "text",
          "value": "<mark>3x3 grid heatmap, small/medium/large grid X low, medium, high density of obstacles?</mark>"
        },
        {
          "type": "text",
          "value": "<mark>visual - here are a few 3 examples of grids, show the best/worst perform side by side?</mark>"
        },
        {
          "type": "text",
          "value": "Deeper on cognitive science of spatial reasoning limits. Working memory, chunking, bounded rationality, etc."
        },
        {
          "type": "text",
          "value": "So what does all this say about how your mind works?"
        },
        {
          "type": "text",
          "value": "<mark>one liner synopsis - highlight how they are similar or different from the global results and heuristics</mark>"
        },
        {
          "type": "text",
          "value": "<mark>x/y scatter of their efficiency on small vs large (their dot vs all readers), color by heuristic?</mark>"
        },
        {
          "type": "text",
          "value": "tk"
        },
        {
          "type": "text",
          "value": "Let readers replay against various layouts or grid sizes."
        },
        {
          "type": "text",
          "value": "<mark>The 100-layout challenge from the heuristic benchmarks could live here as a “beat the algorithm” mode.</mark>"
        }
      ]
    }
  ]
}`;var $e=k('<p> </p> <progress max="100"></progress>',1);function We(t,n){let a=q(n,"label",3,"A"),r=q(n,"value",3,0);var o=$e(),l=U(o),u=v(l,!0);d(l);var p=g(l,2);j(()=>{S(u,a()),ce(p,r())}),b(t,o)}var Ye=k('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function ze(t,n){N(n,!0);const{body:a}=fe,r={Test:We};var o=Ye(),l=g(v(o),2),u=v(l),p=v(u,!0);d(u),d(l);var y=g(l,2);ve(y,{get components(){return r},get body(){return a}}),d(o),j(s=>S(p,s),[()=>Ne.replace(/\t/g," ")]),b(t,o),$()}const He=(t,n=X)=>{var a=Je(),r=v(a),o=v(r,!0);d(r);var l=g(r,2),u=v(l,!0);d(l),d(a),j(()=>{S(o,n().name),S(u,n().age)}),b(t,a)};var Je=k('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),Xe=k('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function Ve(t,n){N(n,!0),q(n,"age",3,30);const a=[{name:"John",age:30},{name:"Jill",age:45}];let r=R(0),o=L(()=>h(r)*2),l=L(()=>h(r)*2),u=R(0);F(()=>{I(u,h(r)*2)});var p=Xe(),y=g(U(p),4),s=g(y,2),i=v(s);d(s);var e=g(s,2),c=v(e);d(e);var x=g(e,2),w=v(x);d(x);var m=g(x,4),D=v(m);ee(D,()=>n.children??X),d(m);var f=g(m,4),_=g(f,4);W(_,21,()=>a,Y,(C,O)=>{He(C,()=>h(O))}),d(_),j(()=>{S(i,`${h(r)??""} doubled is ${h(o)??""} (derived)`),S(c,`${h(r)??""} doubled is ${h(l)??""} (derived by)`),S(w,`${h(r)??""} doubled is ${h(u)??""} ($effect)`)}),G("click",y,()=>re(r)),G("click",f,()=>n.random(Math.floor(Math.random()*10))),b(t,p),$()}ie(["click"]);const Ze=(t,n)=>{let a=R(oe(t)),r=R(null),o=R(!0),l=R(void 0);const u=(s=!0)=>{I(o,s,!0),s===!0&&(I(l,null),I(r,null))},p=async()=>{try{const s=await fetch(h(a),n);if(!s.ok)throw new Error(`Unexpected error occurred (status ${s.status})`);let i;if(h(a).includes(".csv")){const e=await s.text();i=_e(e)}else i=await s.json();return[null,i]}catch(s){const{errorMessage:i="Unexpected error eccurred"}=s;return[i,null]}},y=async s=>{u(!0);const[i,e]=await p();if(s===h(a)){if(i){u(!1),I(l,i,!0);return}u(!1),I(r,e,!0)}};return F(()=>{y(h(a))}),{get data(){return h(r)},get loading(){return h(o)},get error(){return h(l)},get url(){return h(a)},set url(s){h(a)!==s&&I(a,s,!0)}}};var Ge=k("<p>loading data...</p>"),Qe=k("<p> </p>"),Ke=k("<p>data loaded</p> <pre> </pre>",1),et=k('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function tt(t,n){N(n,!0);const a=`${ge}/assets/demo/test.csv`,r=Ze(a);F(()=>{});var o=et(),l=g(v(o),2),u=v(l);{var p=i=>{var e=Ge();b(i,e)},y=i=>{var e=Qe(),c=v(e);d(e),j(()=>S(c,`error: ${r.error??""}`)),b(i,e)},s=i=>{var e=Ke(),c=g(U(e),2),x=v(c,!0);d(c),j(w=>S(x,w),[()=>JSON.stringify(r.data,null,2)]),b(i,e)};pe(u,i=>{r.loading?i(p):r.error?i(y,1):i(s,!1)})}d(l),d(o),b(t,o),$()}var nt=k('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function at(t){let n=R(0);function a(c){console.log(c)}var r=nt(),o=g(v(r),2);Te(o);var l=g(o,2);De(l);var u=g(l,2);Ie(u);var p=g(u,2);Me(p);var y=g(p,2);ze(y,{});var s=g(y,2);tt(s,{});var i=g(s,2);Le(i);var e=g(i,2);Ve(e,{random:a,get value(){return h(n)},set value(c){I(n,c,!0)}}),d(r),b(t,r)}function ft(t){at(t)}export{ft as component};
