
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

		shtml += "	<div>";
		shtml += "	<h3>";
		shtml += "	<span class='text' style='border:none; text-align:left;'> <b>Specification</b> </span>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'gujo' name = 'standard' value = 'gujo' 	onclick = 'mod_rebar_leng.execute()' checked='checked' /><label for='gujo'>콘크리트 구조기준 2012</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'doro' name = 'standard' value = 'doro' 	onclick = 'mod_rebar_leng.execute()'/><label for='doro'>도로교 설계기준 2016</label>";
		shtml += "	</h3>";
		shtml += "	<h3>";
		shtml += "	<span class='text' style='border:none; text-align:left;'> <b>Rebar Type</b> </span>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'KS' 	name = 'rebartype' value = 'KS' 	onclick = 'mod_rebar_leng.execute()' checked='checked' /><label for='KS'>KS D 3504</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'ASTM' name = 'rebartype' value = 'ASTM' 	onclick = 'mod_rebar_leng.execute()'/><label for='ASTM'>ASTM A615</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'BS' 	name = 'rebartype' value = 'BS' 	onclick = 'mod_rebar_leng.execute()'/><label for='BS'>BS 4449</label>";
		shtml += "	</h3>";
		shtml += "	</div>";

		shtml += "	<div id='input' style='width:100%'>";
		shtml += "	</div>";

		shtml += "	<div id='anchor' style='width:100%; text-align : center; '>";
		shtml += "	<h3 style = 'text-align : center;'>";
		shtml += "		<span class='text' style='border:none; text-align:left; width : 250px;' id='cap1'> << 정착장 계산 결과 >> </span>";
		shtml += "	</h3>";
		shtml += "		<table id='tabanc' >	";
		shtml += "		</table>	";
		shtml += "	</div>";

		shtml += "	<div id='lab' style='width:100%;  text-align : center;'>";
		shtml += "	<h3 style = 'text-align : center;'>";
		shtml += "		<span class='text' style='border:none; text-align:left; width : 250px;' id='cap2'> << 겹이음 계산 결과 >> </span>";
		shtml += "	</h3>";
		shtml += "		<table id='tablab' >	";
		shtml += "		</table>	";
		shtml += "	</div>";

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

			mod_rebar_leng.calc_gujo2012();

			document.getElementById("cap1").innerHTML = "<< 정착장 계산 결과 >>";
			document.getElementById("cap2").innerHTML = "<< 겹이음 계산 결과 >>";


		} else if( document.getElementById("doro").checked ){

			document.getElementById("cap1").innerHTML = "<< 정착장/겹이음 계산 결과 >>";
			document.getElementById("cap2").innerHTML = "";

			odiv_input.innerHTML = mod_rebar_leng.html_doro2016();

			// calc fctk ( f_ck 는 fctm = 0.30 f_ck^(2/3) 유효범위인 50 MPa 로 제한 )
			var dfck_disp = Math.min( document.getElementById("fck").value * 1.0, 50.0 );

			document.getElementById("fctk").innerHTML = (mod_concrete.fctk( dfck_disp )).toLocaleString(undefined, {minimumFractionDigits: 3});

			mod_rebar_leng.calc_doro2016();

		}

	}


	this.html_gujo2012 = function(){

		var shtml = '';

		shtml += "</br>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >Conc. f<sub>ck</sub></span> <INPUT id='fck'  value='50' onchange='mod_rebar_leng.calc_gujo2012()'></INPUT> <SPAN class='unit' >Mpa</SPAN>";
		shtml += "	<span class='eq200' >Rebar CTC</span> <INPUT id='ctc'  value='125' onchange='mod_rebar_leng.calc_gujo2012()'></INPUT> <SPAN class='unit' >mm</SPAN>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >Rebar. f<sub>y</sub></span> <INPUT id='fy'  value='400' onchange='mod_rebar_leng.calc_gujo2012()'></INPUT> <SPAN class='unit' >Mpa</SPAN>";
		shtml += "	<span class='eq200' >Conc Cover</span> 	<INPUT id='cover'  value='50' onchange='mod_rebar_leng.calc_gujo2012()'></INPUT> <SPAN class='unit' >mm</SPAN>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >횡철근지수, K<sub>tr</sub></span> <INPUT id='ktr'  value='0.0' onchange='mod_rebar_leng.calc_gujo2012()'></INPUT> <SPAN class='unit' ></SPAN>";
		shtml += "	<span class='eq200' >경량 콘크리트, &lambda;</span> 	<INPUT id='lamda'  value='1.0' onchange='mod_rebar_leng.calc_gujo2012()'></INPUT> <SPAN class='unit' ></SPAN>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='text' style='border:none; text-align:left;'> 계산방법 </span>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'equ' name = 'way' value = 'equ' 	onclick = 'mod_rebar_leng.calc_gujo2012()' checked='checked' /><label for='equ'>계산식</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'fac' name = 'way' value = 'fac' 	onclick = 'mod_rebar_leng.calc_gujo2012()'/><label for='fac'>보정계수</label>";
		shtml += "</h3>";

		return shtml;

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

		shtml  = "<thead>	";
		shtml += "	<tr >	";

		shtml += "		<th style='width:100px;'>철근호칭</th>";
		shtml += "		<th style='width:100px;'>철근직경</th>";

		shtml += "		<th style='width:100px;' colspan='3'>인장철근</th>";
        //shtml += "		<th style='width:100px;'>기타철근</th>";
        //shtml += "		<th style='width:100px;'>표준갈고리</th>";
        shtml += "		<th style='width:100px;'>압축철근</th>";
		shtml += "	</tr>	";

		shtml += "	<tr >	";

		shtml += "		<th style='width:100px;'></th>";
		shtml += "		<th style='width:100px;'></th>";

		shtml += "		<th style='width:100px;'>상부철근</th>";
        shtml += "		<th style='width:100px;'>기타철근</th>";
        shtml += "		<th style='width:100px;'>표준갈고리</th>";
        shtml += "		<th style='width:100px;'></th>";
		shtml += "	</tr>	";

		shtml += "	<tr >	";
		//	UNIT INPUT
		shtml += "		<th > -</th>";
        shtml += "		<th > mm</th>";

		shtml += "		<th > mm</th>";
		shtml += "		<th > mm</th>";
		shtml += "		<th > mm</th>";
		shtml += "		<th > mm</th>";

		shtml += "	</tr>	";
		shtml += "</thead>	";
		shtml += "<tbody>	";
		shtml += "</tbody>	";

		var otable = document.getElementById( starget );
		otable.innerHTML = shtml;

		var itable_row;
		var irow, orow;
		var ocell;

		for( var i=0; i < arebar.length; i++){

			itable_row = otable.rows.length;
			otable.insertRow( itable_row );

			irow = otable.rows.length - 1;
			orow = otable.rows[irow];
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

		shtml  = "<thead>	";
		shtml += "	<tr >	";

		shtml += "		<th style='width:100px;'>철근호칭</th>";
		shtml += "		<th style='width:100px;'>철근직경</th>";

		shtml += "		<th style='width:100px;' colspan='2'>인장철근</th>";
        //shtml += "		<th style='width:100px;'>기타철근</th>";
        //shtml += "		<th style='width:100px;'>표준갈고리</th>";
        shtml += "		<th style='width:100px;'>압축철근</th>";
		shtml += "	</tr>	";

		shtml += "	<tr >	";

		shtml += "		<th style='width:100px;'></th>";
		shtml += "		<th style='width:100px;'></th>";

		shtml += "		<th style='width:100px;'>A급이음</th>";
        shtml += "		<th style='width:100px;'>B급이음</th>";
        shtml += "		<th style='width:100px;'></th>";
		shtml += "	</tr>	";

		shtml += "	<tr >	";
		//	UNIT INPUT
		shtml += "		<th > -</th>";
        shtml += "		<th > mm</th>";

		shtml += "		<th > mm</th>";
		shtml += "		<th > mm</th>";
		shtml += "		<th > mm</th>";

		shtml += "	</tr>	";
		shtml += "</thead>	";
		shtml += "<tbody>	";
		shtml += "</tbody>	";

		var otable = document.getElementById( starget );
		otable.innerHTML = shtml;

		var itable_row;
		var irow, orow;
		var ocell;

		for( var i=0; i < arebar.length; i++){

			itable_row = otable.rows.length;
			otable.insertRow( itable_row );

			irow = otable.rows.length - 1;
			orow = otable.rows[irow];
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

		var shtml = '';

		shtml += "</br>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >Conc. f<sub>ck</sub></span> <INPUT id='fck'  value='50' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' >Mpa</SPAN>";
		shtml += "	<span class='eq200' >Rebar CTC</span> <INPUT id='ctc'  value='125' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' >mm</SPAN>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >철근설계응력 &sigma;<sub>sd</sub></span> <INPUT id='sigma'  value='400' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' >Mpa</SPAN>";
		shtml += "	<span class='eq200' >Conc. Cover</span> 	<INPUT id='cover'  value='50' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' >mm</SPAN>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "</h3>";


		shtml += "<h3>";
		shtml += "	<span class='eq200' >콘크리트재료계수, &phi;<sub>c</sub></span> <INPUT id='phic'  value='0.65' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' ></SPAN>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >콘크리트기준인장강도, f<sub>ctk</sub></span> <span id='fctk'  class='text'></span> <SPAN class='unit' >Mpa</SPAN>";
		shtml += "  , where f<sub>ctk</sub> = 0.21 (f<sub>ck</sub>)<sup>2/3</sup>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >철근 부착조건 계수, &eta;<sub>1</sub></span>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'good' name = 'eta1' value = '1.0' checked='checked' onclick ='mod_rebar_leng.calc_doro2016()' /><label for='good'>양호 (1.0)</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'bad' name = 'eta1' value = '0.7' onclick ='mod_rebar_leng.calc_doro2016()' /><label for='bad'>그외/슬립폼 (0.7)</label>";
		shtml += "</h3>";

		shtml += "<h3>";
		shtml += "	<span class='eq200' >횡철근 구속 계수, &alpha;<sub>3</sub></span>";
		shtml += "	<span class='eq200' >K</span> ";
 		shtml += "		<input style='width:50px;' type='radio' id = 'a3k1' name = 'k' value = '0.1'  onclick ='mod_rebar_leng.calc_doro2016()'/><label for='a3k1'>0.1</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'a3k2' name = 'k' value = '0.05' onclick ='mod_rebar_leng.calc_doro2016()'/><label for='a3k2'>0.05</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'a3k3' name = 'k' value = '0.0'  checked='checked' onclick ='mod_rebar_leng.calc_doro2016()'/><label for='a3k3'>0.0</label>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' ></span>";
		shtml += "	<span class='eq200' >&lambda; = (&Sigma;A<sub>st</sub> &nbsp;-&nbsp; &Sigma;A<sub>st,min</sub>) / As</span> <INPUT id='lambda'  value='0.0' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' ></SPAN>";
		shtml += "</h3>";

		shtml += "<h3>";
		shtml += "	<span class='eq200' >횡방향 압력 계수, &alpha;<sub>5</sub></span>";
		shtml += "	<span class='eq200' >횡방향 압력, p</span> <INPUT id='p'  value='0.0' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' >Mpa</SPAN>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >정착부 형상계수(그외열), &alpha;<sub>1</sub></span>";
		shtml += "		<input style='width:50px;' type='radio' id = 'a6c4' name = 'alp6' value = '1.0' onclick = 'mod_rebar_leng.calc_doro2016()' checked='checked' /><label for='a6c4'>직선/기타 1.0</label>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'a6c1' name = 'alp6' value = '0.7' onclick = 'mod_rebar_leng.calc_doro2016()' /><label for='a6c1'>표준갈고리/구부림 0.7</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'a6c2' name = 'alp6' value = '0.5' onclick = 'mod_rebar_leng.calc_doro2016()' /><label for='a6c2'>0.5</label>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'a6c3' name = 'alp6' value = '0.4' onclick = 'mod_rebar_leng.calc_doro2016()' /><label for='a6c3'>0.4</label>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >겹침이음된 철근비 계수, &alpha;<sub>6</sub></span>";
		shtml += "		<input style='width:50px;' type='radio' id = 'a6lapc1' name = 'alp6lap' value = '1.00' onclick = 'mod_rebar_leng.calc_doro2016()' checked='checked' /><label for='a6lapc1'>1.0 (<25%)</label>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'a6lapc2' name = 'alp6lap' value = '1.15' onclick = 'mod_rebar_leng.calc_doro2016()' /><label for='a6lapc2'>1.15 (33%)</label>";
		shtml += "		<input style='width:50px;' type='radio' id = 'a6lapc3' name = 'alp6lap' value = '1.40' onclick = 'mod_rebar_leng.calc_doro2016()' /><label for='a6lapc3'>1.4 (50%)</label>";
 		shtml += "		<input style='width:50px;' type='radio' id = 'a6lapc4' name = 'alp6lap' value = '1.50' onclick = 'mod_rebar_leng.calc_doro2016()' /><label for='a6lapc4'>1.5 (>50%)</label>";
		shtml += "</h3>";
		shtml += "<h3>";
		shtml += "	<span class='eq200' >필요 철근 단면적, A<sub>s,req</sub></span> 	<INPUT id='asreq'  value='1' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' >mm<sup>2</sup></SPAN>";
		shtml += "	<span class='eq200' >사용 철근 단면적, A<sub>s,prov</sub></span> 	<INPUT id='asprov'  value='1' onchange ='mod_rebar_leng.calc_doro2016()'></INPUT> <SPAN class='unit' >mm<sup>2</sup></SPAN>";
		shtml += "</h3>";

		return shtml;

	}

	this.calc_doro2016 = function(){

        var dfcm, dfctk, dphic, dk, dlambda, dp, dsigma;
        var eta1, eta2, cd, alpha1, alpha2, alpha3, alpha4, alpha5, alpha, asreq, asprov ;
        var dfbd, dlb, dlbmin, dlbminc, dl0min;

        dfck    = document.getElementById("fck").value * 1.0;
        dfck    = Math.min(dfck, 50.0);
		dfctk 	= mod_concrete.fctk( dfck );
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

		shtml  = "<thead>	";
		shtml += "	<tr >	";

		shtml += "		<th style='width:100px;'>철근호칭</th>";
		shtml += "		<th style='width:100px;'>철근직경</th>";
		shtml += "		<th style='width:100px;'>정착부형태</th>";

		shtml += "		<th style='width:100px;' colspan='2'>정착장</th>";
        //shtml += "		<th style='width:100px;'>기타철근</th>";
        //shtml += "		<th style='width:100px;'>표준갈고리</th>";
        shtml += "		<th style='width:100px;'>겹이음</th>";
		shtml += "	</tr>	";

		shtml += "	<tr >	";

		shtml += "		<th style='width:100px;'></th>";
		shtml += "		<th style='width:100px;'></th>";
		shtml += "		<th style='width:100px;'></th>";

		shtml += "		<th style='width:100px;'>인장측</th>";
        shtml += "		<th style='width:100px;'>압축측</th>";
        shtml += "		<th style='width:100px;'></th>";
		shtml += "	</tr>	";

		shtml += "	<tr >	";
		//	UNIT INPUT
		shtml += "		<th >-</th>";
        shtml += "		<th >mm</th>";
		shtml += "		<th >-</th>";

		shtml += "		<th >mm</th>";
		shtml += "		<th >mm</th>";
		shtml += "		<th >mm</th>";

		shtml += "	</tr>	";
		shtml += "</thead>	";
		shtml += "<tbody>	";
		shtml += "</tbody>	";

		var otable = document.getElementById( starget );
		otable.innerHTML = shtml;

		var itable_row;
		var irow, orow;
		var ocell;

		for( var i = 0; i < arebar.length; i++){

			for( var j = 0; j < 2; j++){

				itable_row = otable.rows.length;
				otable.insertRow( itable_row );

				irow = otable.rows.length - 1;
				orow = otable.rows[irow];
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
