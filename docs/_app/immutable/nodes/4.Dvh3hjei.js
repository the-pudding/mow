import"../chunks/DsnmJJEf.js";import{aj as g,a0 as d,a1 as v,a2 as U,t as I,L as p,ak as $,_ as F,G as P,$ as L,a5 as z,O as j,aI as ae,ap as M,be as re,M as oe}from"../chunks/BHq5QaFd.js";import{b,f as x,c as X,t as se}from"../chunks/CzLmae73.js";import{b as D,g as ie,f as G}from"../chunks/B-EcIxLo.js";import{e as Y,i as W,c as le,d as ce}from"../chunks/Ba50pWiT.js";import{e as ue}from"../chunks/llq3-YZR.js";import{c as me,b as pe,i as he}from"../chunks/Di9gwBeW.js";import{s as ve,p as R}from"../chunks/DtK74uso.js";import{s as ee}from"../chunks/B9yPAbJr.js";import{C as de,c as fe}from"../chunks/B6Msjpwi.js";import{b as ge}from"../chunks/BoLMWfpi.js";import"../chunks/Cock485a.js";var Q={},H={},J=34,N=10,V=13;function te(t){return new Function("d","return {"+t.map(function(n,a){return JSON.stringify(n)+": d["+a+'] || ""'}).join(",")+"}")}function ye(t,n){var a=te(t);return function(r,o){return n(a(r),o,t)}}function K(t){var n=Object.create(null),a=[];return t.forEach(function(r){for(var o in r)o in n||a.push(n[o]=o)}),a}function T(t,n){var a=t+"",r=a.length;return r<n?new Array(n-r+1).join(0)+a:a}function we(t){return t<0?"-"+T(-t,6):t>9999?"+"+T(t,6):T(t,4)}function be(t){var n=t.getUTCHours(),a=t.getUTCMinutes(),r=t.getUTCSeconds(),o=t.getUTCMilliseconds();return isNaN(t)?"Invalid Date":we(t.getUTCFullYear())+"-"+T(t.getUTCMonth()+1,2)+"-"+T(t.getUTCDate(),2)+(o?"T"+T(n,2)+":"+T(a,2)+":"+T(r,2)+"."+T(o,3)+"Z":r?"T"+T(n,2)+":"+T(a,2)+":"+T(r,2)+"Z":a||n?"T"+T(n,2)+":"+T(a,2)+"Z":"")}function _e(t){var n=new RegExp('["'+t+`
\r]`),a=t.charCodeAt(0);function r(e,c){var _,w,m=o(e,function(S,f){if(_)return _(S,f-1);w=S,_=c?ye(S,c):te(S)});return m.columns=w||[],m}function o(e,c){var _=[],w=e.length,m=0,S=0,f,k=w<=0,C=!1;e.charCodeAt(w-1)===N&&--w,e.charCodeAt(w-1)===V&&--w;function O(){if(k)return H;if(C)return C=!1,Q;var q,B=m,A;if(e.charCodeAt(B)===J){for(;m++<w&&e.charCodeAt(m)!==J||e.charCodeAt(++m)===J;);return(q=m)>=w?k=!0:(A=e.charCodeAt(m++))===N?C=!0:A===V&&(C=!0,e.charCodeAt(m)===N&&++m),e.slice(B+1,q-1).replace(/""/g,'"')}for(;m<w;){if((A=e.charCodeAt(q=m++))===N)C=!0;else if(A===V)C=!0,e.charCodeAt(m)===N&&++m;else if(A!==a)continue;return e.slice(B,q)}return k=!0,e.slice(B,w)}for(;(f=O())!==H;){for(var E=[];f!==Q&&f!==H;)E.push(f),f=O();c&&(E=c(E,S++))==null||_.push(E)}return _}function l(e,c){return e.map(function(_){return c.map(function(w){return i(_[w])}).join(t)})}function u(e,c){return c==null&&(c=K(e)),[c.map(i).join(t)].concat(l(e,c)).join(`
`)}function h(e,c){return c==null&&(c=K(e)),l(e,c).join(`
`)}function y(e){return e.map(s).join(`
`)}function s(e){return e.map(i).join(t)}function i(e){return e==null?"":e instanceof Date?be(e):n.test(e+="")?'"'+e.replace(/"/g,'""')+'"':e}return{parse:r,parseRows:o,format:u,formatBody:h,formatRows:y,formatRow:s,formatValue:i}}var xe=_e(","),ke=xe.parse,Ce=x('<section id="demo-link"><h2>Link</h2> <p><a href="elements">Default element styles demo</a></p> <p><a href="fonts">Pudding-hosted font previews</a></p> <p><a href="ui">BitsUI styled components</a></p></section>');function Te(t){var n=Ce();b(t,n)}var De=x('<section id="demo-image"><h2>Image</h2> <p>img tag</p> <img src="../assets/demo/test.jpg" alt="cat" class="svelte-b56t42"/> <p>background image</p> <div class="svelte-b56t42"></div></section>');function Se(t){var n=De();b(t,n)}var Ie=x('<section id="demo-element"><h2>Dynamic Svelte Element</h2> <!></section>');function je(t){const n=[{tag:"h3",text:"I am a h3 tag."},{tag:"p",text:"I am p tag."}];var a=Ie(),r=g(d(a),2);Y(r,17,()=>n,W,(o,l)=>{let u=()=>p(l).tag,h=()=>p(l).text;var y=X(),s=U(y);ue(s,u,!1,(i,e)=>{var c=se();I(()=>D(c,h())),b(e,c)}),b(o,y)}),v(a),b(t,a)}var Ae=x("<p> </p>");function Re(t,n){var a=Ae(),r=d(a);v(a),I(()=>D(r,`I am component A and my favorite number is ${n.number??""}.`)),b(t,a)}var Me=x("<p> </p>");function Oe(t,n){var a=Me(),r=d(a);v(a),I(()=>D(r,`I am component B and my name is ${n.name??""}.`)),b(t,a)}var Ee=x('<section id="demo-component"><h2>Dynamic Svelte Component</h2> <!></section>');function qe(t){const n={A:Re,B:Oe},a=[{component:"A",number:42},{component:"B",name:"Russell"}];var r=Ee(),o=g(d(r),2);Y(o,17,()=>a,W,(l,u)=>{const h=$(()=>n[p(u).component]);var y=X(),s=U(y);me(s,()=>p(h),(i,e)=>{e(i,ve(()=>p(u)))}),b(l,y)}),v(r),b(t,r)}var Be=x("<div><!></div>");function Ue(t,n){F(n,!0);let a=R(n,"root",3,null),r=R(n,"top",3,0),o=R(n,"bottom",3,0),l=R(n,"increments",3,100),u=R(n,"value",15,void 0),h=[],y=[],s=[],i=[],e;function c(){let f=0,k=0;for(let C=0;C<h.length;C++)h[C]>f&&(f=h[C],k=C);f>0?u(k):u(void 0)}function _(f,k){const C=Z=>{Z[0].isIntersecting;const ne=Z[0].intersectionRatio;h[k]=ne,c()},O=r()?r()*-1:0,E=o()?o()*-1:0,q=`${O}px 0px ${E}px 0px`,B={root:a(),rootMargin:q,threshold:y};i[k]&&i[k].disconnect();const A=new IntersectionObserver(C,B);A.observe(f),i[k]=A}function w(){s.length&&s.forEach(_)}P(()=>{for(let f=0;f<l()+1;f++)y.push(f/l());s=e.querySelectorAll(":scope > *:not(iframe)"),w()}),P(()=>{r(),o(),w()});var m=Be(),S=d(m);ee(S,()=>n.children??z),v(m),pe(m,f=>e=f,()=>e),b(t,m),L()}var Ne=x('<div><p class="svelte-1sxgmm9"> </p></div>'),Pe=x('<section id="scrolly"><h2 class="svelte-1sxgmm9">Scrolly <span> </span></h2> <div class="spacer svelte-1sxgmm9"></div> <!> <div class="spacer svelte-1sxgmm9"></div></section>');function $e(t){let n=M(void 0);var a=Pe(),r=d(a),o=g(d(r)),l=d(o,!0);v(o),v(r);var u=g(r,4);Ue(u,{get value(){return p(n)},set value(h){j(n,h,!0)},children:(h,y)=>{var s=X(),i=U(s);Y(i,16,()=>[0,1,2,3,4],W,(e,c,_)=>{const w=$(()=>p(n)===_);var m=Ne();let S;var f=d(m),k=d(f,!0);v(f),v(m),I(()=>{S=le(m,1,"step svelte-1sxgmm9",null,S,{active:p(w)}),D(k,c)}),b(e,m)}),b(h,s)},$$slots:{default:!0}}),ae(2),v(a),I(()=>D(l,p(n)||"-")),b(t,a)}const Fe=`{
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
      "section": "results",
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
          "value": "The premise is simple: a salesman must visit a set of cities exactly once and return to their starting point, all while taking the shortest possible route. We see this all the time in the real world. From a pizza delivery driver planning their stops to a trick-or-treater maximizing their candy haul, finding the most efficient routes would be solving a version of this problem."
        },
        {
          "type": "text",
          "value": "I wanted to create this mowing experiment after I <a href=https://docs.lib.purdue.edu/jps/vol1/iss1/4/ target=_blank rel=noreferrer>read a study</a> that found humans come impressively close to computer-calculated optimal solutions to this problem with fewer stops, and even do pretty good &mdash; just 11% less efficient than optimal &mdash; for 70+ stops. But as the stops increase, humans’ ability decreases."
        },
        {
          "type": "Img",
          "value": {
            "src": "assets/images/study.png",
            "alt": "A chart depicting how people perform on the Traveling Salesman Problem compared to the optimal path, which shows that people perform near-ideal at fewer nodes, with a slow increasing deviation as more nodes are added",
            "figcaption": "Chart of findings from <a href=https://docs.lib.purdue.edu/jps/vol1/iss1/4/ target=_blank rel=noreferrer>this study</a>"
          }
        }
      ]
    }
  ]
}`;var Le=x('<p> </p> <progress max="100"></progress>',1);function Ye(t,n){let a=R(n,"label",3,"A"),r=R(n,"value",3,0);var o=Le(),l=U(o),u=d(l,!0);v(l);var h=g(l,2);I(()=>{D(u,a()),ce(h,r())}),b(t,o)}var We=x('<section id="cms"><h2>MicroCMS</h2> <code><pre> </pre></code> <!></section>');function He(t,n){F(n,!0);const{body:a}=fe,r={Test:Ye};var o=We(),l=g(d(o),2),u=d(l),h=d(u,!0);v(u),v(l);var y=g(l,2);de(y,{get components(){return r},get body(){return a}}),v(o),I(s=>D(h,s),[()=>Fe.replace(/\t/g," ")]),b(t,o),L()}const Je=(t,n=z)=>{var a=Ve(),r=d(a),o=d(r,!0);v(r);var l=g(r,2),u=d(l,!0);v(l),v(a),I(()=>{D(o,n().name),D(u,n().age)}),b(t,a)};var Ve=x('<div class="person svelte-q3gttf"><p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p></div>'),ze=x('<h2>Svelte5</h2> <h3>Reactive variables 3 ways:</h3> <button class="svelte-q3gttf">count++</button> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <p class="svelte-q3gttf"> </p> <h3>Children (previously slots):</h3> <div class="children"><!></div> <h3>Dispatch Event</h3> <button class="svelte-q3gttf">Random</button>  <h3>Snippets</h3> <div class="people svelte-q3gttf"></div>',1);function Xe(t,n){F(n,!0),R(n,"age",3,30);const a=[{name:"John",age:30},{name:"Jill",age:45}];let r=M(0),o=$(()=>p(r)*2),l=$(()=>p(r)*2),u=M(0);P(()=>{j(u,p(r)*2)});var h=ze(),y=g(U(h),4),s=g(y,2),i=d(s);v(s);var e=g(s,2),c=d(e);v(e);var _=g(e,2),w=d(_);v(_);var m=g(_,4),S=d(m);ee(S,()=>n.children??z),v(m);var f=g(m,4),k=g(f,4);Y(k,21,()=>a,W,(C,O)=>{Je(C,()=>p(O))}),v(k),I(()=>{D(i,`${p(r)??""} doubled is ${p(o)??""} (derived)`),D(c,`${p(r)??""} doubled is ${p(l)??""} (derived by)`),D(w,`${p(r)??""} doubled is ${p(u)??""} ($effect)`)}),G("click",y,()=>re(r)),G("click",f,()=>n.random(Math.floor(Math.random()*10))),b(t,h),L()}ie(["click"]);const Ze=(t,n)=>{let a=M(oe(t)),r=M(null),o=M(!0),l=M(void 0);const u=(s=!0)=>{j(o,s,!0),s===!0&&(j(l,null),j(r,null))},h=async()=>{try{const s=await fetch(p(a),n);if(!s.ok)throw new Error(`Unexpected error occurred (status ${s.status})`);let i;if(p(a).includes(".csv")){const e=await s.text();i=ke(e)}else i=await s.json();return[null,i]}catch(s){const{errorMessage:i="Unexpected error eccurred"}=s;return[i,null]}},y=async s=>{u(!0);const[i,e]=await h();if(s===p(a)){if(i){u(!1),j(l,i,!0);return}u(!1),j(r,e,!0)}};return P(()=>{y(p(a))}),{get data(){return p(r)},get loading(){return p(o)},get error(){return p(l)},get url(){return p(a)},set url(s){p(a)!==s&&j(a,s,!0)}}};var Ge=x("<p>loading data...</p>"),Qe=x("<p> </p>"),Ke=x("<p>data loaded</p> <pre> </pre>",1),et=x('<div class="c"><h2>Load Data</h2> <div class="response"><!></div></div>');function tt(t,n){F(n,!0);const a=`${ge}/assets/demo/test.csv`,r=Ze(a);P(()=>{});var o=et(),l=g(d(o),2),u=d(l);{var h=i=>{var e=Ge();b(i,e)},y=i=>{var e=Qe(),c=d(e);v(e),I(()=>D(c,`error: ${r.error??""}`)),b(i,e)},s=i=>{var e=Ke(),c=g(U(e),2),_=d(c,!0);v(c),I(w=>D(_,w),[()=>JSON.stringify(r.data,null,2)]),b(i,e)};he(u,i=>{r.loading?i(h):r.error?i(y,1):i(s,!1)})}v(l),v(o),b(t,o),L()}var nt=x('<div id="demo" class="svelte-15aotx7"><h1>Demo</h1> <!> <!> <!> <!> <!> <!> <!> <!></div>');function at(t){let n=M(0);function a(c){console.log(c)}var r=nt(),o=g(d(r),2);Te(o);var l=g(o,2);Se(l);var u=g(l,2);je(u);var h=g(u,2);qe(h);var y=g(h,2);He(y,{});var s=g(y,2);tt(s,{});var i=g(s,2);$e(i);var e=g(i,2);Xe(e,{random:a,get value(){return p(n)},set value(c){j(n,c,!0)}}),v(r),b(t,r)}function ft(t){at(t)}export{ft as component};
