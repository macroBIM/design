
var mod_concrete = new function(){

	// 콘크리트 평균인장강도  f_ctm = 0.30 * f_ck^(2/3)   ( f_ck <= 50 MPa 유효 )
	this.fctm = function( fck ){
		fck = fck * 1.0;
		if( fck <= 0 ){ return 0; }
		return 0.30 * Math.pow( fck, 2/3 );
	};

	// 콘크리트 기준(특성)인장강도  f_ctk = f_ctk,0.05 = 0.7 * f_ctm = 0.21 * f_ck^(2/3)
	this.fctk = function( fck ){
		fck = fck * 1.0;
		if( fck <= 0 ){ return 0; }
		return 0.21 * Math.pow( fck, 2/3 );
	};

};
