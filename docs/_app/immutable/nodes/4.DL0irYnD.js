import"../chunks/DsnmJJEf.js";import{ao as g,a0 as d,a1 as h,a2 as U,t as I,L as m,a3 as $,_ as N,G as L,$ as P,a6 as X,O as j,aI as oe,ap as R,be as ae,M as re}from"../chunks/DojfsZy9.js";import{b as w,f as _,c as H,t as se}from"../chunks/Da-TwTi_.js";import{b as S,g as ie,f as G}from"../chunks/N0bdfAmT.js";import{e as W,i as z,c as le,d as ce}from"../chunks/CUz53e6T.js";import{e as ue}from"../chunks/CFRUBbSZ.js";import{c as pe,b as me,i as ve}from"../chunks/BRzcXqFZ.js";import{s as he,p as B}from"../chunks/oFawhgBR.js";import{s as ee}from"../chunks/Hdaj9e-O.js";import{C as de,c as fe}from"../chunks/CguJtNtK.js";import{b as ge}from"../chunks/Dg7qjkRk.js";import"../chunks/Cock485a.js";var Q={},Y={},J=34,F=10,V=13;function te(t){return new Function("d","return {"+t.map(function(n,o){return JSON.stringify(n)+": d["+o+'] || ""'}).join(",")+"}")}function ye(t,n){var o=te(t);return function(a,r){return n(o(a),r,t)}}function K(t){var n=Object.create(null),o=[];return t.forEach(function(a){for(var r in a)r in n||o.push(n[r]=r)}),o}function T(t,n){var o=t+"",a=o.length;return a<n?new Array(n-a+1).join(0)+o:o}function be(t){return t<0?"-"+T(-t,6):t>9999?"+"+T(t,6):T(t,4)}function we(t){var n=t.getUTCHours(),o=t.getUTCMinutes(),a=t.getUTCSeconds(),r=t.getUTCMilliseconds();return isNaN(t)?"Invalid Date":be(t.getUTCFullYear())+"-"+T(t.getUTCMonth()+1,2)+"-"+T(t.getUTCDate(),2)+(r?"T"+T(n,2)+":"+T(o,2)+":"+T(a,2)+"."+T(r,3)+"Z":a?"T"+T(n,2)+":"+T(o,2)+":"+T(a,2)+"Z":o||n?"T"+T(n,2)+":"+T(o,2)+"Z":"")}function xe(t){var n=new RegExp('["'+t+`
\r]`),o=t.charCodeAt(0);function a(e,c){var x,b,p=r(e,function(D,f){if(x)return x(D,f-1);b=D,x=c?ye(D,c):te(D)});return p.columns=b||[],p}function r(e,c){var x=[],b=e.length,p=0,D=0,f,k=b<=0,C=!1;e.charCodeAt(b-1)===F&&--b,e.charCodeAt(b-1)===V&&--b;function M(){if(k)return Y;if(C)return C=!1,Q;var O,q=p,A;if(e.charCodeAt(q)===J){for(;p++<b&&e.charCodeAt(p)!==J||e.charCodeAt(++p)===J;);return(O=p)>=b?k=!0:(A=e.charCodeAt(p++))===F?C=!0:A===V&&(C=!0,e.charCodeAt(p)===F&&++p),e.slice(q+1,O-1).replace(/""/g,'"')}for(;p<b;){if((A=e.charCodeAt(O=p++))===F)C=!0;else if(A===V)C=!0,e.charCodeAt(p)===F&&++p;else if(A!==o)continue;return e.slice(q,O)}return k=!0,e.slice(q,b)}for(;(f=M())!==Y;){for(var E=[];f!==Q&&f!==Y;)E.push(f),f=M();c&&(E=c(E,D++))==null||x.push(E)}return x}function l(e,c){return e.map(function(x){return c.map(function(b){return i(x[b])}).join(t)})}function u(e,c){return c==null&&(c=K(e)),[c.map(i).join(t)].concat(l(e,c)).join(`
`)}function v(e,c){return c==null&&(c=K(e)),l(e,c).join(`
`)}function y(e){return e.map(s).join(`
`)}function s(e){return e.map(i).join(t)}function i(e){return e==null?"":e instanceof Date?we(e):n.test(e+="")?'"'+e.replace(/"/g,'""')+'"':e}return{parse:a,parseRows:r,format:u,formatBody:v,formatRows:y,formatRow:s,formatValue:i}}var _e=xe(","),ke=_e.parse,Ce=_('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function Te(t){var n=Ce();w(t,n)}var Se=_('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function De(t){var n=Se();w(t,n)}var Ie=_('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function je(t){const n=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var o=Ie(),a=g(d(o),2);W(a,17,()=>n,z,(r,l)=>{let u=()=>m(l).tag,v=()=>m(l).text;var y=H(),s=U(y);ue(s,u,!1,(i,e)=>{var c=se();I(()=>S(c,v())),w(e,c)}),w(r,y)}),h(o),w(t,o)}var Ae=_("<p> </p>");function Be(t,n){var o=Ae(),a=d(o);h(o),I(()=>S(a,`I am component A and my favorite number is ${n.number??""}.`)),w(t,o)}var Re=_("<p> </p>");function Me(t,n){var o=Re(),a=d(o);h(o),I(()=>S(a,`I am component B and my name is ${n.name??""}.`)),w(t,o)}var Ee=_('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function Oe(t){const n={A:Be,B:Me},o=[{component:"A",number:42},{component:"B",name:"Russell"}];var a=Ee(),r=g(d(a),2);W(r,17,()=>o,z,(l,u)=>{const v=$(()=>n[m(u).component]);var y=H(),s=U(y);pe(s,()=>m(v),(i,e)=>{e(i,he(()=>m(u)))}),w(l,y)}),h(a),w(t,a)}var qe=_("<div><!></div>");function Ue(t,n){N(n,!0);let o=B(n,"root",3,null),a=B(n,"top",3,0),r=B(n,"bottom",3,0),l=B(n,"increments",3,100),u=B(n,"value",15,void 0),v=[],y=[],s=[],i=[],e;function c(){let f=0,k=0;for(let C=0;C<v.length;C++)v[C]>f&&(f=v[C],k=C);f>0?u(k):u(void 0)}function x(f,k){const C=Z=>{Z[0].isIntersecting;const ne=Z[0].intersectionRatio;v[k]=ne,c()},M=a()?a()*-1:0,E=r()?r()*-1:0,O=`${M}px 0px ${E}px 0px`,q={root:o(),rootMargin:O,threshold:y};i[k]&&i[k].disconnect();const A=new IntersectionObserver(C,q);A.observe(f),i[k]=A}function b(){s.length&&s.forEach(x)}L(()=>{for(let f=0;f<l()+1;f++)y.push(f/l());s=e.querySelectorAll(":scope > *:not(iframe)"),b()}),L(()=>{a(),r(),b()});var p=qe(),D=d(p);ee(D,()=>n.children??X),h(p),me(p,f=>e=f,()=>e),w(t,p),P()}var Fe=_('<div><p class="svelte-1sxgmm9"> </p></div>'),Le=_('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function $e(t){let n=R(void 0);var o=Le(),a=d(o),r=g(d(a)),l=d(r,!0);h(r),h(a);var u=g(a,4);Ue(u,{get value(){return m(n)},set value(v){j(n,v,!0)},children:(v,y)=>{var s=H(),i=U(s);W(i,16,()=>[0,1,2,3,4],z,(e,c,x)=>{const b=$(()=>m(n)===x);var p=Fe();let D;var f=d(p),k=d(f,!0);h(f),h(p),I(()=>{D=le(p,1,"step svelte-1sxgmm9",null,D,{active:m(b)}),S(k,c)}),w(e,p)}),w(v,s)},$$slots:{default:!0}}),oe(2),h(o),I(()=>S(l,m(n)||"-")),w(t,o)}const Ne=`{
  "aside": "Work in complexity/Big-O and why computers also struggle at scale.",
  "title": "Mow this lawn. Learn about your brain.",
  "description": "Your lawn mowing style says more about you than you think.",
  "byline": "By <a href=https://pudding.cool/author/russell-samora target=_blank rel=noreferrer>Russell Samora</a>",
  "body": [
    {
      "section": "story",
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
      "section": "results",
      "content": [
        {
          "type": "text",
          "value": "So far, <strong class=field>X</strong> other people have mowed this lawn. <span class=you>Your technique was better than <strong class=percent-vs-field>X%</strong> of them. <strong class=custom-field></strong></span>"
        },
        {
          "type": "text",
          "value": "If we abstract away the mowing, it’s really just a path formed by connecting nodes. <span class=you>You were <strong class=percent-vs-optimal>X%</strong> less efficient than the optimal path, which looks like this:</span><span class=skip>The optimal path looks like this (TODO):</span>"
        },
        {
          "type": "Result",
          "value": {}
        },
        {
          "type": "text",
          "value": "<span class=custom-humans>Surprisingly,</span> most humans are actually really good at finding solutions to pathfinding problems like this. The most popular example is the <a href=https://en.wikipedia.org/wiki/Travelling_salesman_problem target=_blank rel=noreferrer>Traveling Salesman Problem.</a>"
        },
        {
          "type": "Video",
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
          "value": "The premise is simple: a salesperson must visit a set of cities exactly once and return to their starting point, all while taking the shortest possible route. We see this all the time in the real world. From a pizza delivery driver planning their stops to a trick-or-treater maximizing their candy haul, finding the most efficient routes would be solving a version of this problem."
        },
        {
          "type": "text",
          "value": "I <a href=https://docs.lib.purdue.edu/jps/vol1/iss1/4/ target=_blank rel=noreferrer>read a study</a> that found humans come impressively close to computer-calculated optimal solutions to this problem with fewer stops, and even do pretty good &mdash; just 11% less efficient than optimal &mdash; for 70+ stops."
        },
        {
          "type": "Img",
          "value": {
            "src": "assets/images/study.png",
            "alt": "A chart depicting how people perform on the Traveling Salesman Problem compared to the optimal path, which shows that people perform near-ideal at fewer nodes, with a slow increasing deviation as more nodes are added",
            "figcaption": "Chart of findings from <a href=https://docs.lib.purdue.edu/jps/vol1/iss1/4/ target=_blank rel=noreferrer>this study</a>"
          }
        },
        {
          "type": "text",
          "value": "<strong>I was curious; how well might humans perform on a similar optimization problem?</strong>"
        },
        {
          "type": "text",
          "value": "But first, a <em>very quick</em> computer science primer. There are two main ways to tackle problems like these: <strong>algorithms</strong> that calculate the optimal path and <strong>heuristics</strong>—simple strategies for completing the task."
        },
        {
          "type": "text",
          "value": "<strong>Algorithms</strong> solve the problem with an estimated optimal solution. But that can come at a cost as complexity grows. For example, brute force calculations for a salesperson visiting <strong>just 10 cities</strong> requires testing <strong>3.6 million</strong> possible routes, and that number explodes exponentially as more cities are added."
        },
        {
          "type": "text",
          "value": "<strong>15 cities</strong> and we’re at <strong>1.3 trillion</strong> possible routes. 😱"
        },
        {
          "type": "text",
          "value": "<strong>20 cities</strong> balloons to <strong>2.4 quintillion</strong> possible routes. 🤯"
        },
        {
          "type": "text",
          "value": "<strong>Heuristics</strong> are a lot like human problem-solving; they aim for a good-enough strategy that solves the problem quickly. For example, choosing the closest city at each step isn’t perfect, but it’s much faster and usually close to the optimal route."
        },
        {
          "type": "text",
          "value": "For our experiment, we’ll stick with heuristics."
        },
        {
          "type": "text",
          "value": "<span class=you><strong>What type of computer-y brain do you have?</strong>  Our sorting hat determined that your mowing style is most similar to the <strong class=sorting-hat>X</strong> heuristic.</span><span class=skip>So what type of computer-brain do most people have?</span>"
        },
        {
          "type": "text",
          "value": "<mark>(graphic breakdown of all users and the most similar heuristic types)</mark>"
        },
        {
          "type": "text",
          "value": "We chose to look at seven different heuristics for our lawn mower game, which is a problem more formally called <strong>Coverage Path Planning.</strong> To focus on your path planning vs. driving skills, we simplified the world into a grid of cells."
        },
        {
          "type": "text",
          "value": "Each heuristic follows a different approach to visit each cell on the grid. To get a sense of their general style, here are all seven heuristics on an empty grid with no obstacles."
        },
        {
          "type": "text",
          "value": "<mark>(graphic  animate all 7, rate efficiency)</mark>"
        },
        {
          "type": "text",
          "value": "But an open lawn or an empty grid isn’t that interesting. Things get more fun—and complex—when we introduce obstacles."
        },
        {
          "type": "text",
          "value": "<mark>(graphic animate all 7, rate efficiency)</mark>"
        },
        {
          "type": "text",
          "value": "But this is just one layout. We gave each heuristic 100 different layouts to see how they handled various situations."
        },
        {
          "type": "text",
          "value": "<mark>(graphic some other viz, maybe high level results)</mark>"
        },
        {
          "type": "text",
          "value": "Tk talk about complexity scores and Big-O notation. Why not."
        },
        {
          "type": "text",
          "value": "Okay so that is the heuristics. Let’s get back to the humans. Here is a distribution of how well people did compared to the optimal solution."
        },
        {
          "type": "text",
          "value": "<mark>(graphic breakdown of how optimal everyone performed / you)</mark>"
        },
        {
          "type": "text",
          "value": "Tk explanation of why humans are good at this."
        },
        {
          "type": "text",
          "value": "Tk wrap things up."
        },
        {
          "type": "text",
          "value": "<mark>(graphic maybe a situation changer so they can go up against all 100 layouts from earlier)</mark>"
        }
      ]
    }
  ]
}`;var Pe=_('<p> </p> <progress max="100"></progress>',1);function We(t,n){let o=B(n,"label",3,"A"),a=B(n,"value",3,0);var r=Pe(),l=U(r),u=d(l,!0);h(l);var v=g(l,2);I(()=>{S(u,o()),ce(v,a())}),w(t,r)}var ze=_('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function Ye(t,n){N(n,!0);const{body:o}=fe,a={Test:We};var r=ze(),l=g(d(r),2),u=d(l),v=d(u,!0);h(u),h(l);var y=g(l,2);de(y,{get components(){return a},get body(){return o}}),h(r),I(s=>S(v,s),[()=>Ne.replace(/\t/g," ")]),w(t,r),P()}const Je=(t,n=X)=>{var o=Ve(),a=d(o),r=d(a,!0);h(a);var l=g(a,2),u=d(l,!0);h(l),h(o),I(()=>{S(r,n().name),S(u,n().age)}),w(t,o)};var Ve=_('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),Xe=_('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function He(t,n){N(n,!0),B(n,"age",3,30);const o=[{name:"John",age:30},{name:"Jill",age:45}];let a=R(0),r=$(()=>m(a)*2),l=$(()=>m(a)*2),u=R(0);L(()=>{j(u,m(a)*2)});var v=Xe(),y=g(U(v),4),s=g(y,2),i=d(s);h(s);var e=g(s,2),c=d(e);h(e);var x=g(e,2),b=d(x);h(x);var p=g(x,4),D=d(p);ee(D,()=>n.children??X),h(p);var f=g(p,4),k=g(f,4);W(k,21,()=>o,z,(C,M)=>{Je(C,()=>m(M))}),h(k),I(()=>{S(i,`${m(a)??""} doubled is ${m(r)??""} (derived)`),S(c,`${m(a)??""} doubled is ${m(l)??""} (derived by)`),S(b,`${m(a)??""} doubled is ${m(u)??""} ($effect)`)}),G("click",y,()=>ae(a)),G("click",f,()=>n.random(Math.floor(Math.random()*10))),w(t,v),P()}ie(["click"]);const Ze=(t,n)=>{let o=R(re(t)),a=R(null),r=R(!0),l=R(void 0);const u=(s=!0)=>{j(r,s,!0),s===!0&&(j(l,null),j(a,null))},v=async()=>{try{const s=await fetch(m(o),n);if(!s.ok)throw new Error(`Unexpected error occurred (status ${s.status})`);let i;if(m(o).includes(".csv")){const e=await s.text();i=ke(e)}else i=await s.json();return[null,i]}catch(s){const{errorMessage:i="Unexpected error eccurred"}=s;return[i,null]}},y=async s=>{u(!0);const[i,e]=await v();if(s===m(o)){if(i){u(!1),j(l,i,!0);return}u(!1),j(a,e,!0)}};return L(()=>{y(m(o))}),{get data(){return m(a)},get loading(){return m(r)},get error(){return m(l)},get url(){return m(o)},set url(s){m(o)!==s&&j(o,s,!0)}}};var Ge=_("<p>loading data...</p>"),Qe=_("<p> </p>"),Ke=_("<p>data loaded</p> <pre> </pre>",1),et=_('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function tt(t,n){N(n,!0);const o=`${ge}/assets/demo/test.csv`,a=Ze(o);L(()=>{});var r=et(),l=g(d(r),2),u=d(l);{var v=i=>{var e=Ge();w(i,e)},y=i=>{var e=Qe(),c=d(e);h(e),I(()=>S(c,`error: ${a.error??""}`)),w(i,e)},s=i=>{var e=Ke(),c=g(U(e),2),x=d(c,!0);h(c),I(b=>S(x,b),[()=>JSON.stringify(a.data,null,2)]),w(i,e)};ve(u,i=>{a.loading?i(v):a.error?i(y,1):i(s,!1)})}h(l),h(r),w(t,r),P()}var nt=_('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function ot(t){let n=R(0);function o(c){console.log(c)}var a=nt(),r=g(d(a),2);Te(r);var l=g(r,2);De(l);var u=g(l,2);je(u);var v=g(u,2);Oe(v);var y=g(v,2);Ye(y,{});var s=g(y,2);tt(s,{});var i=g(s,2);$e(i);var e=g(i,2);He(e,{random:o,get value(){return m(n)},set value(c){j(n,c,!0)}}),h(a),w(t,a)}function ft(t){ot(t)}export{ft as component};
