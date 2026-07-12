
var mod_rebar_leng = new function(){

	var arebar;
	var aresult;
	var ldbt, ldbn, ldbc, ldbh, lstag, lstagb, lstagc;
	var ldorot,ldoroc,ldorolap;

	var dfck, dfcm, dfctk, dctc, dcover;
	var dfy;

	this.init	= function( stargetid ){

		var otarget = document.getElementById( stargetid );
			otarget.innerHTML = '';

		var	shtml	=	"";

		/* ── 기준 / 철근 규격 선택 카드 ── */
		shtml += "<div class='draw-card'>";
		shtml += "  <div class='draw-card-header'><div><div class='draw-card-title'>철근 정착 · 겹침이음 길이</div><div class='draw-card-desc'>설계기준과 철근 규격을 선택하세요</div></div></div>";
		shtml += "  <div class='draw-card-body'>";
		shtml += "    <div class='rl-row'><div class='rl-lbl'>설계기준</div><div class='rl-opts'>";
		shtml += "      <label><input type='radio' id='gujo' name='standard' value='gujo' checked onclick='mod_rebar_leng.execute()'>콘크리트구조기준 2012</label>";
		shtml += "      <label><input type='radio' id='doro' name='standard' value='doro' onclick='mod_rebar_leng.execute()'>도로교 설계기준 2016</label>";
		shtml += "    </div></div>";
		shtml += "    <div class='rl-row'><div class='rl-lbl'>철근 규격</div><div class='rl-opts'>";
		shtml += "      <label><input type='radio' id='KS' name='rebartype' value='KS' checked onclick='mod_rebar_leng.execute()'>KS D 3504</label>";
		shtml += "      <label><input type='radio' id='ASTM' name='rebartype' value='ASTM' onclick='mod_rebar_leng.execute()'>ASTM A615</label>";
		shtml += "      <label><input type='radio' id='BS' name='rebartype' value='BS' onclick='mod_rebar_leng.execute()'>BS 4449</label>";
		shtml += "    </div></div>";
		shtml += "  </div>";
		shtml += "</div>";

		/* ── 입력 폼 ── */
		shtml += "<div id='input'></div>";

		/* ── 결과표 : 정착장 ── */
		shtml += "<div id='anchor' class='table-card'>";
		shtml += "  <div class='table-card-header'><div class='table-card-title' id='cap1'>정착장 계산 결과</div><div class='table-card-desc'>단위: mm</div></div>";
		shtml += "  <div style='overflow-x:auto;'><table id='tabanc' class='ea-table striped rebar'></table></div>";
		shtml += "</div>";

		/* ── 결과표 : 겹이음 ── */
		shtml += "<div id='lab' class='table-card'>";
		shtml += "  <div class='table-card-header'><div class='table-card-title' id='cap2'>겹이음 계산 결과</div><div class='table-card-desc'>단위: mm</div></div>";
		shtml += "  <div style='overflow-x:auto;'><table id='tablab' class='ea-table striped rebar'></table></div>";
		shtml += "</div>";

        otarget.innerHTML	=	shtml;

		this.execute();

	}

	this.execute = function(){

		// initialize form
		document.getElementById( 'tabanc' ).innerHTML = '';
		document.getElementById( 'tablab' ).innerHTML = '';

		var odiv_input = document.getElementById( 'input' );
			odiv_input.innerHTML = '';

		// loading rebar array
		if( document.getElementById( 'KS' ).checked ){

			arebar = mod_rebar.get_KS();

		} else if( document.getElementById( 'ASTM' ).checked ){

			arebar = mod_rebar.get_ASTM();

		} else if( document.getElementById( 'BS' ).checked ){

			arebar = mod_rebar.get_BS();

		}

		// create template
		if( document.getElementById("gujo").checked ){

			odiv_input.innerHTML = mod_rebar_leng.html_gujo2012();

			document.getElementById("cap1").innerHTML = "정착장 계산 결과";
			document.getElementById("cap2").innerHTML = "겹이음 계산 결과";
			document.getElementById("lab").style.display = "";

			mod_rebar_leng.calc_gujo2012();


		} else if( document.getElementById("doro").checked ){

			odiv_input.innerHTML = mod_rebar_leng.html_doro2016();

			document.getElementById("cap1").innerHTML = "정착장 / 겹이음 계산 결과";
			document.getElementById("lab").style.display = "none";	// 도로교는 통합표 1개

			mod_rebar_leng.calc_doro2016();

		}

	}


	this.html_gujo2012 = function(){

		var s = '';

		s += "<div class='draw-card'>";
		s += "  <div class='draw-card-header'><div><div class='draw-card-title'>입력값 &mdash; 콘크리트구조기준 2012</div><div class='draw-card-desc'>재료 · 기하 및 계산방법</div></div></div>";
		s += "  <div class='draw-card-body'>";
		s += "    <div class='form-grid-6col'>";
		s += "      <div class='col-label'>Conc. f<sub>ck</sub> (MPa)</div><input class='form-input' id='fck' value='50' onchange='mod_rebar_leng.calc_gujo2012()'>";
		s += "      <div class='col-label'>Rebar CTC (mm)</div><input class='form-input' id='ctc' value='125' onchange='mod_rebar_leng.calc_gujo2012()'>";
		s += "      <div class='col-label'>Rebar f<sub>y</sub> (MPa)</div><input class='form-input' id='fy' value='400' onchange='mod_rebar_leng.calc_gujo2012()'>";
		s += "      <div class='col-label'>Conc. Cover (mm)</div><input class='form-input' id='cover' value='50' onchange='mod_rebar_leng.calc_gujo2012()'>";
		s += "      <div class='col-label'>횡철근지수 K<sub>tr</sub></div><input class='form-input' id='ktr' value='0.0' onchange='mod_rebar_leng.calc_gujo2012()'>";
		s += "      <div class='col-label'>경량계수 &lambda;</div><input class='form-input' id='lamda' value='1.0' onchange='mod_rebar_leng.calc_gujo2012()'>";
		s += "    </div>";
		s += "    <div class='rl-row' style='margin-top:14px;'><div class='rl-lbl'>계산방법</div><div class='rl-opts'>";
		s += "      <label><input type='radio' id='equ' name='way' value='equ' checked onclick='mod_rebar_leng.calc_gujo2012()'>계산식 (정밀)</label>";
		s += "      <label><input type='radio' id='fac' name='way' value='fac' onclick='mod_rebar_leng.calc_gujo2012()'>보정계수 (간편)</label>";
		s += "    </div></div>";
		s += "  </div>";
		s += "</div>";

		return s;

	}

	this.calc_gujo2012 = function(){

		dfck    = document.getElementById('fck').value * 1.0;
		dfy     = document.getElementById('fy').value * 1.0;
		dcover  = document.getElementById('cover').value * 1.0;
		dctc    = document.getElementById('ctc').value * 1.0;

		var dlambda = document.getElementById('lamda').value * 1.0;
		var dktr    = document.getElementById('ktr').value * 1.0;

	    var l_db_fac = function(){

	        //  l_d = 0.6 * db * fy / (lambda * sqrt(fck)) * alpha  ( 간편식, 배근조건 만족 )
	        //  gamma = 0.8 (D19 이하), alpha = 1.3 (상부) / 1.0 (기타), beta = 1.0 가정

	        ldbt = [];
	        ldbn = [];

	        for( var i = 0; i < arebar.length; i++){

	            ldbt[i] = 0.6 * arebar[i][1] * dfy / dlambda / Math.pow( dfck , 0.5 ) * 1.3;
	            ldbn[i] = 0.6 * arebar[i][1] * dfy / dlambda / Math.pow( dfck , 0.5 ) * 1.0;

	            if( arebar[i][1] < 19.5 ){

	                ldbt[i] = 0.8 * ldbt[i];
	                ldbn[i] = 0.8 * ldbn[i];

	            }

				ldbt[i] = Math.max( Math.ceil( ldbt[i] / 10 ) * 10, 300 );
				ldbn[i] = Math.max( Math.ceil( ldbn[i] / 10 ) * 10, 300 );
	        }
	    }

	    var l_db_equ = function(){

			// l_d = 0.9 * db * fy / (lambda * sqrt(fck)) * alpha / ( (c + K_tr) / db )  ( 정밀식 )
			// beta = 1.0 가정, gamma = 0.8 (D19 이하), alpha = 1.3 (상부) / 1.0 (기타)

			ldbt = [];
			ldbn = [];
			var dc      = Math.min(dcover, 0.5 * dctc) * 1.0;
			var dcc;

			for( var i = 0; i < arebar.length; i++){

				dcc = Math.min( ( dc + dktr ) / arebar[i][1] , 2.5 ) * 1.0;

				ldbt[i] =  0.9 * arebar[i][1] * dfy / dlambda / Math.pow( dfck , 0.5 ) / ( dcc ) * 1.3;
				ldbn[i] =  0.9 * arebar[i][1] * dfy / dlambda / Math.pow( dfck , 0.5 ) / ( dcc ) * 1.0;

				if( arebar[i][1] < 19.5 ){

					ldbt[i] = 0.8 * ldbt[i];
					ldbn[i] = 0.8 * ldbn[i];

				}

				ldbt[i] = Math.max( Math.ceil( ldbt[i] / 10 ) * 10, 300 );
				ldbn[i] = Math.max( Math.ceil( ldbn[i] / 10 ) * 10, 300 );

			}

	    }

		var l_hook = function(){

			ldbh = [];

			for( var i = 0; i < arebar.length; i++){

				// 표준갈고리 기본정착길이 l_hb = 0.24 * beta * db * fy / (lambda * sqrt(fck)), beta = 1.0 가정
				// 최소 max( 8*db, 150mm )
				ldbh[i] = 0.24 * arebar[i][1] * dfy / dlambda / Math.pow( dfck , 0.5 );
				ldbh[i] = Math.max( ldbh[i], 8 * arebar[i][1] );
				ldbh[i] = Math.max( Math.ceil( ldbh[i] / 10 ) * 10 , 150 );
			}

		}

		var l_comp = function(){

			ldbc = [];

			for( var i = 0; i < arebar.length; i++){

				// 압축 기본정착길이 l_db = 0.25 * db * fy / (lambda * sqrt(fck)) >= 0.043 * db * fy, 최소 200mm
				ldbc[i] = 0.25 * arebar[i][1] * dfy / dlambda / Math.pow( dfck , 0.5 );
				ldbc[i] = Math.max( ldbc[i], 0.043 * arebar[i][1] * dfy );
				ldbc[i] = Math.max( Math.ceil( ldbc[i] / 10 ) * 10 , 200 );
			}

		}

	    var l_stag = function(){

			lstag = [];
			lstagb = [];
			lstagc = [];

			var dc      = Math.min(dcover, 0.5 * dctc) * 1.0;
			var dcc;
			var dlstag, dlstagc;

			for( var i = 0; i < arebar.length; i++){

				dcc = Math.min( ( dc + dktr ) / arebar[i][1] , 2.5 ) * 1.0;

				// 인장 겹침이음 기준이 되는 정착길이 l_d ( 정밀식, alpha = 1.0 )
				dlstag = 0.9 * arebar[i][1] * dfy / dlambda / Math.pow( dfck , 0.5 ) / ( dcc ) ;

				if( arebar[i][1] < 35.0 ){

					if( arebar[i][1] < 19.5 ){

						dlstag = 0.8 * dlstag;
					}

					// A급 = 1.0 l_d, B급 = 1.3 l_d, 최소 300mm
					lstag[i] = Math.max( Math.ceil( dlstag / 10 ) * 10, 300 );

					lstagb[i] = Math.max( Math.ceil( ( 1.3 * dlstag )/ 10 ) * 10, 300 );

				} else {

					lstag[i] = 0;

					lstagb[i] = 0;

				}

				// 압축철근 겹침이음길이
				//   fy <= 400 : 0.072 * fy * db
				//   fy >  400 : (0.13 * fy - 24) * db
				//   최소 300mm, fck < 21 이면 1/3 증가
				if( dfy <= 400 ){

					dlstagc = 0.072 * dfy * arebar[i][1];

				} else {

					dlstagc = ( 0.13 * dfy - 24 ) * arebar[i][1];
				}

				dlstagc = Math.max( dlstagc , 300 );

				if( dfck < 21 ){ dlstagc = dlstagc * 4 / 3; }

				lstagc[i] = Math.ceil( dlstagc / 10 ) * 10;
			}

	    }

		//
		// calculate
		//
	    if( document.getElementById( 'equ' ).checked){

	        l_db_equ();

	    } else if( document.getElementById( 'fac' ).checked) {

	        l_db_fac();
	    }

	    l_hook();
	    l_comp();
	    l_stag();

		// print result
		this.table_gujo2012_anc( 'tabanc' );

		this.table_gujo2012_lap( 'tablab' );

	}

	this.table_gujo2012_anc = function( starget ){

		var shtml;

		shtml  = "<thead>";
		shtml += "	<tr>";
		shtml += "		<th rowspan='2'>철근호칭</th>";
		shtml += "		<th rowspan='2'>철근직경<br>(mm)</th>";
		shtml += "		<th colspan='3'>인장 정착길이 (mm)</th>";
		shtml += "		<th rowspan='2'>압축 정착<br>(mm)</th>";
		shtml += "	</tr>";
		shtml += "	<tr>";
		shtml += "		<th>상부철근</th>";
		shtml += "		<th>기타철근</th>";
		shtml += "		<th>표준갈고리</th>";
		shtml += "	</tr>";
		shtml += "</thead>";
		shtml += "<tbody></tbody>";

		var otable = document.getElementById( starget );
		otable.innerHTML = shtml;
		var otbody = otable.tBodies[0];

		var orow;
		var ocell;

		for( var i=0; i < arebar.length; i++){

			orow = otbody.insertRow(-1);
			// 철근 번호
			ocell = orow.insertCell(0);
			ocell.innerHTML = arebar[i][0];
			// 철근 직경
			ocell = orow.insertCell(1);
			ocell.innerHTML = arebar[i][1];

			// 상부철근
			ocell = orow.insertCell(2);
			ocell.innerHTML = ldbt[i].toLocaleString(undefined, {minimumFractionDigits: 0});
			// 기타철근
			ocell = orow.insertCell(3);
			ocell.innerHTML = ldbn[i].toLocaleString(undefined, {minimumFractionDigits: 0});
			// 표준갈고리
			ocell = orow.insertCell(4);
			ocell.innerHTML = ldbh[i].toLocaleString(undefined, {minimumFractionDigits: 0});
			// 압축철근
			ocell = orow.insertCell(5);
			ocell.innerHTML = ldbc[i].toLocaleString(undefined, {minimumFractionDigits: 0});
		}

	}

	this.table_gujo2012_lap = function( starget ){

		var shtml;

		shtml  = "<thead>";
		shtml += "	<tr>";
		shtml += "		<th rowspan='2'>철근호칭</th>";
		shtml += "		<th rowspan='2'>철근직경<br>(mm)</th>";
		shtml += "		<th colspan='2'>인장 겹침이음 (mm)</th>";
		shtml += "		<th rowspan='2'>압축 겹침<br>(mm)</th>";
		shtml += "	</tr>";
		shtml += "	<tr>";
		shtml += "		<th>A급 이음</th>";
		shtml += "		<th>B급 이음</th>";
		shtml += "	</tr>";
		shtml += "</thead>";
		shtml += "<tbody></tbody>";

		var otable = document.getElementById( starget );
		otable.innerHTML = shtml;
		var otbody = otable.tBodies[0];

		var orow;
		var ocell;

		for( var i=0; i < arebar.length; i++){

			orow = otbody.insertRow(-1);
			// 철근 번호
			ocell = orow.insertCell(0);
			ocell.innerHTML = arebar[i][0];
			// 철근 직경
			ocell = orow.insertCell(1);
			ocell.innerHTML = arebar[i][1];

			// A급이음
			ocell = orow.insertCell(2);
			ocell.innerHTML = lstag[i].toLocaleString(undefined, {minimumFractionDigits: 0});
			// B급이음
			ocell = orow.insertCell(3);
			ocell.innerHTML = lstagb[i].toLocaleString(undefined, {minimumFractionDigits: 0});
			// 압축철근
			ocell = orow.insertCell(4);
			ocell.innerHTML = lstagc[i].toLocaleString(undefined, {minimumFractionDigits: 0});
		}

	}



	this.html_doro2016 = function(){

		var s = '';

		s += "<div class='draw-card'>";
		s += "  <div class='draw-card-header'><div><div class='draw-card-title'>입력값 &mdash; 도로교 설계기준 2016 (한계상태)</div><div class='draw-card-desc'>재료 · 기하 및 정착 · 겹침 계수</div></div></div>";
		s += "  <div class='draw-card-body'>";

		/* 재료 / 기하 */
		s += "    <div class='form-grid-6col'>";
		s += "      <div class='col-label'>Conc. f<sub>ck</sub> (MPa)</div><input class='form-input' id='fck' value='50' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "      <div class='col-label'>Rebar CTC (mm)</div><input class='form-input' id='ctc' value='125' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "      <div class='col-label'>철근설계응력 &sigma;<sub>sd</sub> (MPa)</div><input class='form-input' id='sigma' value='400' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "      <div class='col-label'>Conc. Cover (mm)</div><input class='form-input' id='cover' value='50' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "      <div class='col-label'>콘크리트재료계수 &phi;<sub>c</sub></div><input class='form-input' id='phic' value='0.65' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "      <div class='col-label'>기준인장강도 f<sub>ctk</sub> (MPa)</div><div class='rl-readonly'><span id='fctk' class='fctk-val'></span> <span class='rl-hint'>= 0.21 f<sub>ck</sub><sup>2/3</sup></span></div>";
		s += "    </div>";

		/* 계수 */
		s += "    <div class='rl-sec-title'>정착 · 겹침 계수</div>";

		s += "    <div class='rl-row'><div class='rl-lbl'>부착조건 &eta;<sub>1</sub></div><div class='rl-opts'>";
		s += "      <label><input type='radio' id='good' name='eta1' value='1.0' checked onclick='mod_rebar_leng.calc_doro2016()'>양호 (1.0)</label>";
		s += "      <label><input type='radio' id='bad' name='eta1' value='0.7' onclick='mod_rebar_leng.calc_doro2016()'>그외/슬립폼 (0.7)</label>";
		s += "    </div></div>";

		s += "    <div class='rl-row'><div class='rl-lbl'>횡철근구속 &alpha;<sub>3</sub> (K)</div><div class='rl-opts'>";
		s += "      <label><input type='radio' id='a3k1' name='k' value='0.1' onclick='mod_rebar_leng.calc_doro2016()'>0.1</label>";
		s += "      <label><input type='radio' id='a3k2' name='k' value='0.05' onclick='mod_rebar_leng.calc_doro2016()'>0.05</label>";
		s += "      <label><input type='radio' id='a3k3' name='k' value='0.0' checked onclick='mod_rebar_leng.calc_doro2016()'>0.0</label>";
		s += "      <span class='rl-hint'>&lambda; = (&Sigma;A<sub>st</sub> &minus; &Sigma;A<sub>st,min</sub>) / A<sub>s</sub></span>";
		s += "      <input id='lambda' value='0.0' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "    </div></div>";

		s += "    <div class='rl-row'><div class='rl-lbl'>횡방향압력 &alpha;<sub>5</sub></div><div class='rl-opts'>";
		s += "      <span class='rl-hint'>p (MPa)</span><input id='p' value='0.0' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "    </div></div>";

		s += "    <div class='rl-row'><div class='rl-lbl'>정착부형상 &alpha;<sub>1</sub> (그외열)</div><div class='rl-opts'>";
		s += "      <label><input type='radio' id='a6c4' name='alp6' value='1.0' checked onclick='mod_rebar_leng.calc_doro2016()'>직선/기타 1.0</label>";
		s += "      <label><input type='radio' id='a6c1' name='alp6' value='0.7' onclick='mod_rebar_leng.calc_doro2016()'>갈고리/구부림 0.7</label>";
		s += "      <label><input type='radio' id='a6c2' name='alp6' value='0.5' onclick='mod_rebar_leng.calc_doro2016()'>0.5</label>";
		s += "      <label><input type='radio' id='a6c3' name='alp6' value='0.4' onclick='mod_rebar_leng.calc_doro2016()'>0.4</label>";
		s += "    </div></div>";

		s += "    <div class='rl-row'><div class='rl-lbl'>겹침철근비 &alpha;<sub>6</sub></div><div class='rl-opts'>";
		s += "      <label><input type='radio' id='a6lapc1' name='alp6lap' value='1.00' checked onclick='mod_rebar_leng.calc_doro2016()'>1.0 (&lt;25%)</label>";
		s += "      <label><input type='radio' id='a6lapc2' name='alp6lap' value='1.15' onclick='mod_rebar_leng.calc_doro2016()'>1.15 (33%)</label>";
		s += "      <label><input type='radio' id='a6lapc3' name='alp6lap' value='1.40' onclick='mod_rebar_leng.calc_doro2016()'>1.4 (50%)</label>";
		s += "      <label><input type='radio' id='a6lapc4' name='alp6lap' value='1.50' onclick='mod_rebar_leng.calc_doro2016()'>1.5 (&gt;50%)</label>";
		s += "    </div></div>";

		/* 겹침이음 철근량 */
		s += "    <div class='form-grid-6col' style='margin-top:14px;'>";
		s += "      <div class='col-label'>필요철근량 A<sub>s,req</sub> (mm²)</div><input class='form-input' id='asreq' value='1' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "      <div class='col-label'>사용철근량 A<sub>s,prov</sub> (mm²)</div><input class='form-input' id='asprov' value='1' onchange='mod_rebar_leng.calc_doro2016()'>";
		s += "      <div></div><div></div>";
		s += "    </div>";

		s += "  </div>";
		s += "</div>";

		return s;

	}

	this.calc_doro2016 = function(){

        var dfcm, dfctk, dphic, dk, dlambda, dp, dsigma;
        var eta1, eta2, cd, alpha1, alpha2, alpha3, alpha4, alpha5, alpha, asreq, asprov ;
        var dfbd, dlb, dlbmin, dlbminc, dl0min;

        dfck    = document.getElementById("fck").value * 1.0;
        dfck    = Math.min(dfck, 50.0);
		dfctk 	= mod_concrete.fctk( dfck );
		// f_ctk 표시값 갱신
		document.getElementById("fctk").innerHTML = dfctk.toLocaleString(undefined, {minimumFractionDigits: 3});
        dphic   = document.getElementById("phic").value * 1.0;
        dctc    = document.getElementById("ctc").value * 1.0;
        dcover  = document.getElementById("cover").value * 1.0;
        dlambda = document.getElementById("lambda").value * 1.0;
        dp      = document.getElementById("p").value * 1.0;
        dsigma  = document.getElementById("sigma").value * 1.0;
		asreq   = document.getElementById("asreq").value * 1.0;
		asprov  = document.getElementById("asprov").value * 1.0;
		if( asprov <= 0 ){ asprov = 1.0; }

        /* eta1 */
        if( document.getElementById("good").checked ){

            eta1 = document.getElementById("good").value * 1.0 ;

        } else if( document.getElementById("bad").checked ){

            eta1 = document.getElementById("bad").value * 1.0;

        }

        /* K */
        if( document.getElementById("a3k1").checked ){

            dk = document.getElementById("a3k1").value * 1.0 ;

        } else if( document.getElementById("a3k2").checked ){

            dk = document.getElementById("a3k2").value * 1.0 ;

        } else if( document.getElementById("a3k3").checked ){

            dk = document.getElementById("a3k3").value * 1.0 ;
        }

        /* 정착부 형상계수 ( 그외 열 ) : 직선=1.0, 표준갈고리/구부림=0.7, 기타 0.5/0.4 */
		var dAnchorForm = 1.0;
        if( document.getElementById("a6c1").checked ){
            dAnchorForm = document.getElementById("a6c1").value * 1.0;
        } else if( document.getElementById("a6c2").checked ){
            dAnchorForm = document.getElementById("a6c2").value * 1.0;
        } else if( document.getElementById("a6c3").checked ){
            dAnchorForm = document.getElementById("a6c3").value * 1.0;
        } else if( document.getElementById("a6c4").checked ){
            dAnchorForm = document.getElementById("a6c4").value * 1.0;
        }

        /* 겹침이음 철근비 계수 alpha6 ( 1.0 / 1.15 / 1.4 / 1.5 ) */
		var alpha6_lap_value = 1.0;
        if( document.getElementById("a6lapc1").checked ){
            alpha6_lap_value = document.getElementById("a6lapc1").value * 1.0;
        } else if( document.getElementById("a6lapc2").checked ){
            alpha6_lap_value = document.getElementById("a6lapc2").value * 1.0;
        } else if( document.getElementById("a6lapc3").checked ){
            alpha6_lap_value = document.getElementById("a6lapc3").value * 1.0;
        } else if( document.getElementById("a6lapc4").checked ){
            alpha6_lap_value = document.getElementById("a6lapc4").value * 1.0;
		}

		// calculation
		aresult = [];
		ldorot	= [];
		ldoroc	= [];
		ldorolap	= [];

		for( var i = 0; i < arebar.length; i++){

            var db = arebar[i][1];

            /* eta2 : db <= 32 -> 1.0 , db > 32 -> (132-db)/100 */
            if( db <= 32.0 ){
                eta2 = 1.0;
            } else {
                eta2 = (132.0 - db ) / 100.0;
            }

            /* 설계부착강도 fbd = phi_c * 2.25 * eta1 * eta2 * fctk */
            dfbd = dphic * 2.25 * eta1 * eta2 * dfctk;

            /* 기본정착길이 lb = db/4 * sigma_sd / fbd */
            dlb = db / 4 * dsigma / dfbd ;

            /* 최소값 : 정착 15db (원문 4.5.5.2 확인 권장, EC2 기준은 10db) , 겹침 15db */
            dlbmin 	= Math.max( 0.3 * dlb , 15 * db , 100.0 );
            dlbminc = Math.max( 0.6 * dlb , 15 * db , 100.0 );
			dl0min 	= Math.max( 0.3 * alpha6_lap_value * dlb , 15 * db , 200.0 );

            /* cd */
            cd = Math.min( dcover, dctc / 2 );

            /* alpha1 ( 형상 ) : [0] 직선 = 1.0 , [1] 그외 = 라디오 선택값 */
            alpha1 = [];
            alpha1[0] = 1.0;
            alpha1[1] = dAnchorForm;

            /* alpha2 ( 피복 ) : [0] 직선 , [1] 그외 */
            alpha2 = [];
            alpha2[0] = 1 - 0.15 * ( cd - 1 * db ) / db;
            alpha2[0] = Math.min( 1.0 , Math.max( 0.7 , alpha2[0]) );
            alpha2[1] = 1 - 0.15 * ( cd - 3 * db ) / db;
            alpha2[1] = Math.min( 1.0 , Math.max( 0.7 , alpha2[1]) );

            /* alpha3 ( 횡철근 구속 ) = 1 - K*lambda */
            alpha3 = [];
            alpha3[0] = 1 - dk * dlambda ;
            alpha3[0] = Math.min( 1.0 , Math.max( 0.7 , alpha3[0]) );
            alpha3[1] = alpha3[0];

            /* alpha4 ( 용접 횡철근 ) : 기본값 1.0 ( 용접 횡철근 있을 때만 0.7 ) */
            alpha4 = [];
            alpha4[0] = 1.0;
            alpha4[1] = 1.0;

            /* alpha5 ( 횡방향 압력 ) = 1 - 0.04*p */
            alpha5 = [];
            alpha5[0] = 1 - 0.04 * dp;
            alpha5[0] = Math.min( 1.0 , Math.max( 0.7 , alpha5[0]) );
            alpha5[1] = alpha5[0];

            /* 구속조건 : alpha2 * alpha3 * alpha5 >= 0.7 */
            var conf0 = Math.max( alpha2[0] * alpha3[0] * alpha5[0] , 0.7 );
            var conf1 = Math.max( alpha2[1] * alpha3[1] * alpha5[1] , 0.7 );

			/* 정착장 인장측 : lbd = alpha1 * (alpha2*alpha3*alpha5) * alpha4 * lb >= lb,min */
			ldorot[i] =[];
			ldorot[i][0] = Math.max( alpha1[0] * conf0 * alpha4[0] * dlb , dlbmin );
			ldorot[i][1] = Math.max( alpha1[1] * conf1 * alpha4[1] * dlb , dlbmin );

			/* 정착장 압축측 : 계수 모두 1.0 ( 용접 횡철근 시 alpha4=0.7 ) , >= lb,min(압축) */
			ldoroc[i] =[];
			ldoroc[i][0] = Math.max( dlb , dlbminc );	// 직선
			ldoroc[i][1] = Math.max( dlb , dlbminc );	// 그외

			/* 겹이음 : l0 = alpha1 * (alpha2*alpha3*alpha5) * alpha6 * lb * (As,req/As,prov) >= l0,min */
			ldorolap[i] =[];
			ldorolap[i][0] = Math.max( alpha1[0] * conf0 * alpha6_lap_value * dlb * ( asreq / asprov ) , dl0min );	// 직선
			ldorolap[i][1] = Math.max( alpha1[1] * conf1 * alpha6_lap_value * dlb * ( asreq / asprov ) , dl0min );	// 그외

		}

		this.table_doro2016( "tabanc" );

	}

	this.table_doro2016 = function( starget ){

		var shtml;

		shtml  = "<thead>";
		shtml += "	<tr>";
		shtml += "		<th rowspan='2'>철근호칭</th>";
		shtml += "		<th rowspan='2'>철근직경<br>(mm)</th>";
		shtml += "		<th rowspan='2'>정착부<br>형태</th>";
		shtml += "		<th colspan='2'>정착길이 (mm)</th>";
		shtml += "		<th rowspan='2'>겹이음<br>(mm)</th>";
		shtml += "	</tr>";
		shtml += "	<tr>";
		shtml += "		<th>인장측</th>";
		shtml += "		<th>압축측</th>";
		shtml += "	</tr>";
		shtml += "</thead>";
		shtml += "<tbody></tbody>";

		var otable = document.getElementById( starget );
		otable.innerHTML = shtml;
		var otbody = otable.tBodies[0];

		var orow;
		var ocell;

		for( var i = 0; i < arebar.length; i++){

			for( var j = 0; j < 2; j++){

				orow = otbody.insertRow(-1);
				// 철근 번호
				ocell = orow.insertCell(0);
				ocell.innerHTML = arebar[i][0];
				// 철근 직경
				ocell = orow.insertCell(1);
				ocell.innerHTML = arebar[i][1];
				// 정착부 형태
				ocell = orow.insertCell(2);
				if( j == 0 ){

					ocell.innerHTML = "직선";

				} else {

					ocell.innerHTML = "그외";

				}

				// 정착장 인장측
				ocell = orow.insertCell(3);
				ocell.innerHTML = ( Math.ceil( ldorot[i][j] / 10 ) * 10 ).toLocaleString(undefined, {minimumFractionDigits: 0});
				// 정착장 압축측
				ocell = orow.insertCell(4);
				ocell.innerHTML = ( Math.ceil( ldoroc[i][j] / 10 ) * 10 ).toLocaleString(undefined, {minimumFractionDigits: 0});
				// 겹이음
				ocell = orow.insertCell(5);
				ocell.innerHTML = ( Math.ceil( ldorolap[i][j] / 10 ) * 10 ).toLocaleString(undefined, {minimumFractionDigits: 0});

			}

		}

	}

}
