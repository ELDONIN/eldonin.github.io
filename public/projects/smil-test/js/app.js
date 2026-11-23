/* Подсчёт баллов СМИЛ и построение профиля. Работает полностью локально, без обращений к серверу. */
var d1 = [];
log_shala=0;
l_log_skala=0;
f_dost_skala=0;
k_korrekc_skala=0;
e1_sverhkontr_skala=0;
e2_pissim_skala=0;
e3_emoc_lab_skala=0;
e4_impulsiv_skala=0;
e5_genst_skala=0;
e6_rigidnost_skala=0;//Сырые баллы
e7_trevoga_skala=0;
e8_individ_skala=0;
e9_optimist_skala=0;
e0_introversia_skala=0;
enez_skala=0;
function divFunction(id_id,id_v,da,net,neznay)
          {

			       //alert(document.getElementById('vopros_'+id_id).value);
				   //alert(net);
			        document.getElementById('nazv_l').style.color="black";
					document.getElementById('nazv_f').style.color="black";
					document.getElementById('nazv_k').style.color="black";
					document.getElementById('nazv_1').style.color="black";
					document.getElementById('nazv_2').style.color="black";
					document.getElementById('nazv_3').style.color="black";
					document.getElementById('nazv_4').style.color="black";
					document.getElementById('nazv_5').style.color="black";
					document.getElementById('nazv_6').style.color="black";
					document.getElementById('nazv_7').style.color="black";
					document.getElementById('nazv_8').style.color="black";
					document.getElementById('nazv_9').style.color="black";
					document.getElementById('nazv_0').style.color="black";
					//alert(document.getElementById('vopros_'+id_id).value);
                    //     alert(document.getElementById('ispr_'+id_id).value);
					if(document.getElementById('vopros_'+id_id).value==1)
			            {
				         if((net==1)&&(document.getElementById('ispr_'+id_id).value=='200'))
				            {
					         document.getElementById('ispr_'+id_id).value='120';
					         document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
							}
						 else
				            {
					         if((net==1)&&((document.getElementById('ispr_'+id_id).value=='201')||(document.getElementById('ispr_'+id_id).value=='211')))
							    {
							     document.getElementById('ispr_'+id_id).value='121';
								 document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
								 }
							 if((net==1)&&(document.getElementById('ispr_'+id_id).value=='210'))
							    {
							     document.getElementById('ispr_'+id_id).value='120';
								 document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
								 }
					        }
				        }
						if(document.getElementById('vopros_'+id_id).value==1)
			            {
				         if((neznay==1)&&(document.getElementById('ispr_'+id_id).value=='200'))
				            {
					         document.getElementById('ispr_'+id_id).value='102';
					         document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
							}
						     else
				                {
					             if((neznay==1)&&((document.getElementById('ispr_'+id_id).value=='210')||(document.getElementById('ispr_'+id_id).value=='211')||(document.getElementById('ispr_'+id_id).value=='011')))
							       {
							        document.getElementById('ispr_'+id_id).value='112';
                                    document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
								    document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
								  }

								if((neznay==1)&&(document.getElementById('ispr_'+id_id).value=='210')||(document.getElementById('ispr_'+id_id).value=='201'))
							       {
							        document.getElementById('ispr_'+id_id).value='102';
                                    document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
								    document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
								  }
					        }
				        }

					if(document.getElementById('vopros_'+id_id).value==2)
			            {

						 if((da==1)&&(document.getElementById('ispr_'+id_id).value=='020'))
				            {
					         document.getElementById('ispr_'+id_id).value='210';
					         document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
							}
						    else
				                {
					             if((da==1)&&((document.getElementById('ispr_'+id_id).value=='021')||(document.getElementById('ispr_'+id_id).value=='121')))
							       {
							        document.getElementById('ispr_'+id_id).value='211';
								    document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
								   }
					             if((da==1)&&(document.getElementById('ispr_'+id_id).value=='120'))
								      {
									    document.getElementById('ispr_'+id_id).value='210';
								        document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
									   }

								}

				        }
					if(document.getElementById('vopros_'+id_id).value==2)
			            {
				         if((neznay==1)&&(document.getElementById('ispr_'+id_id).value=='020'))
				            {
					         document.getElementById('ispr_'+id_id).value='012';
					         document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
							}
						    else
				                {
					             if((neznay==1)&&(document.getElementById('ispr_'+id_id).value=='120')||(document.getElementById('ispr_'+id_id).value=='121'))
							       {
							        document.getElementById('ispr_'+id_id).value='112';
								    document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
									document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
									}
								 if((neznay==1)&&(document.getElementById('ispr_'+id_id).value=='021'))
							       {
							        document.getElementById('ispr_'+id_id).value='012';
								    document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
									document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
									}
							    }
				        }
                     if(document.getElementById('vopros_'+id_id).value==3)
			            {
				         if((da==1)&&(document.getElementById('ispr_'+id_id).value=='002'))
				            {
					         document.getElementById('ispr_'+id_id).value='201';
					        }
							  else
				                {
					             if((da==1)&&((document.getElementById('ispr_'+id_id).value=='012')||(document.getElementById('ispr_'+id_id).value=='112')))
							       {
							        document.getElementById('ispr_'+id_id).value='211';
								    document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
									}

								 if((da==1)&&(document.getElementById('ispr_'+id_id).value=='102'))
							       {
							        document.getElementById('ispr_'+id_id).value='201';
								    document.getElementById('net_'+id_id).innerHTML="<img src='img/3.gif'>";
									}
							    }
				        }
                     if(document.getElementById('vopros_'+id_id).value==3)
			            {
				         if((net==1)&&(document.getElementById('ispr_'+id_id).value=='002'))
				            {
					         document.getElementById('ispr_'+id_id).value='021';

							}
							 else
				                {
					             if((document.getElementById('ispr_'+id_id).value=='112')||(document.getElementById('ispr_'+id_id).value=='102'))
							       {
							        document.getElementById('ispr_'+id_id).value='121';
								    document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
									}
								 if(document.getElementById('ispr_'+id_id).value=='012')
							       {
							        document.getElementById('ispr_'+id_id).value='021';
								    document.getElementById('da_'+id_id).innerHTML="<img src='img/3.gif'>";
									}
							    }
				        }

			 //alert(document.getElementById('ispr_'+id_id).value);
			//alert(document.getElementById('ispr_'+id_id).value);
			//alert(id_v);

			//alert(document.getElementById('vopros_'+id_id).value)
			document.getElementById(id_v).style.background="#B6F6EE";
		    if(da==1)
			  {
			    //alert(id_id);
				document.getElementById('nez_'+id_id).style.backgroundColor="white";
				document.getElementById('da_'+id_id).innerHTML="<img src='img/2.gif'>";
				//l_log_skala
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==15)||(id_id==30)||(id_id==45)||(id_id==75)||(id_id==105)||(id_id==135)||(id_id==195)||(id_id==225)||(id_id==255)||(id_id==285)||(id_id==60)||(id_id==90)||(id_id==120)||(id_id==150)||(id_id==165)))
                    {
				     l_log_skala--;
					 document.getElementById('nazv_l').style.color="green";
					}
			   //l_log_skala

			   //f_dost_skala
			   //Полож ответы
			   if(((id_id==14)||(id_id==23)||(id_id==27)||(id_id==31)||(id_id==33)||(id_id==34)||(id_id==35)||(id_id==40)||(id_id==42)||(id_id==48)||(id_id==49)||(id_id==50)||(id_id==53)||(id_id==56)||(id_id==66)||(id_id==85)||(id_id==121)||(id_id==123)||(id_id==139)||(id_id==146)||(id_id==151)||(id_id==156)||(id_id==168)||(id_id==184)||(id_id==197)||(id_id==200)||(id_id==202)||(id_id==205)||(id_id==206)||(id_id==209)||(id_id==210)||(id_id==211)||(id_id==215)||(id_id==218)||(id_id==227)||(id_id==245)||(id_id==246)||(id_id==247)||(id_id==252)||(id_id==256)||(id_id==269)||(id_id==275)||(id_id==286)||(id_id==291)||(id_id==293))&&(document.getElementById('vopros_'+id_id).value!=1))//f_dost_skala
			      {
				    f_dost_skala++;
				    document.getElementById('nazv_f').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==17)||(id_id==20)||(id_id==54)||(id_id==65)||(id_id==75)||(id_id==83)||(id_id==112)||(id_id==113)||(id_id==115)||(id_id==164)||(id_id==169)||(id_id==177)||(id_id==185)||(id_id==196)||(id_id==199)||(id_id==220)||(id_id==257)||(id_id==258)||(id_id==272)||(id_id==276)))

				   {
				     f_dost_skala--;
					 document.getElementById('nazv_f').style.color="green";
					}
			   //f_dost_skala



			   //e1_sverhkontr_skala
			   //Полож ответы
			   if(((id_id==23)||(id_id==29)||(id_id==43)||(id_id==62)||(id_id==72)||(id_id==108)||(id_id==114)||(id_id==125)||(id_id==161)||(id_id==189)||(id_id==273))&&(document.getElementById('vopros_'+id_id).value!=1))//e1_sverhkontr_skala


				  {
				    e1_sverhkontr_skala++;
				    document.getElementById('nazv_1').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==2)||(id_id==3)||(id_id==7)||(id_id==9)||(id_id==18)||(id_id==51)||(id_id==55)||(id_id==63)||(id_id==68)||(id_id==103)||(id_id==130)||(id_id==153)||(id_id==155)||(id_id==163)||(id_id==175)||(id_id==188)||(id_id==190)||(id_id==192)||(id_id==230)||(id_id==243)||(id_id==274)||(id_id==281)))

				   {
				     e1_sverhkontr_skala--;
					 document.getElementById('nazv_1').style.color="green";
					}
			   //e1_sverhkontr_skala

			   //e2_pissim_skala=0;
			   //Полож ответы
			   if(((id_id==5)||(id_id==13)||(id_id==23)||(id_id==32)||(id_id==41)||(id_id==43)||(id_id==52)||(id_id==67)||(id_id==86)||(id_id==104)||(id_id==130)||(id_id==138)||(id_id==142)||(id_id==158)||(id_id==159)||(id_id==182)||(id_id==189)||(id_id==193)||(id_id==236)||(id_id==259))&&(document.getElementById('vopros_'+id_id).value!=1))//e1_sverhkontr_skala

				  {
				    e2_pissim_skala++;
				    document.getElementById('nazv_2').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==2)||(id_id==8)||(id_id==9)||(id_id==18)||(id_id==30)||(id_id==36)||(id_id==39)||(id_id==46)||(id_id==51)||(id_id==57)||(id_id==58)||(id_id==64)||(id_id==80)||(id_id==88)||(id_id==89)||(id_id==95)||(id_id==98)||(id_id==107)||(id_id==122)||(id_id==131)||(id_id==145)||(id_id==152)||(id_id==153)||(id_id==154)||(id_id==155)||(id_id==160)||(id_id==178)||(id_id==191)||(id_id==207)||(id_id==208)||(id_id==238)||(id_id==241)||(id_id==242)||(id_id==248)||(id_id==263)||(id_id==270)||(id_id==271)||(id_id==272)||(id_id==285)||(id_id==296)))

				   {
				     e2_pissim_skala--;
					 document.getElementById('nazv_2').style.color="green";
					}
			   //e2_pissim_skala=0;


			   //e3_emoc_lab_skala
			   //Полож ответы
			   if(((id_id==10)||(id_id==23)||(id_id==32)||(id_id==43)||(id_id==44)||(id_id==47)||(id_id==76)||(id_id==114)||(id_id==179)||(id_id==186)||(id_id==189)||(id_id==238))&&(document.getElementById('vopros_'+id_id).value!=1))//e3_emoc_lab_skala
	              {
				    e3_emoc_lab_skala++;
				    document.getElementById('nazv_3').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==2)||(id_id==3)||(id_id==6)||(id_id==7)||(id_id==8)||(id_id==9)||(id_id==12)||(id_id==26)||(id_id==30)||(id_id==51)||(id_id==55)||(id_id==71)||(id_id==89)||(id_id==93)||(id_id==103)||(id_id==107)||(id_id==109)||(id_id==124)||(id_id==128)||(id_id==129)||(id_id==136)||(id_id==137)||(id_id==141)||(id_id==147)||(id_id==153)||(id_id==160)||(id_id==162)||(id_id==163)||(id_id==170)||(id_id==172)||(id_id==174)||(id_id==175)||(id_id==180)||(id_id==188)||(id_id==190)||(id_id==192)||(id_id==201)||(id_id==213)||(id_id==230)||(id_id==234)||(id_id==243)||(id_id==265)||(id_id==267)||(id_id==274)||(id_id==279)||(id_id==289)||(id_id==292)))
                   {
				     e3_emoc_lab_skala--;
					 document.getElementById('nazv_3').style.color="green";
					}
			   //e3_emoc_lab_skala


			   //e4_impulsiv_skala
			   //Полож ответы
			   if(((id_id==16)||(id_id==21)||(id_id==24)||(id_id==32)||(id_id==33)||(id_id==35)||(id_id==36)||(id_id==42)||(id_id==61)||(id_id==67)||(id_id==84)||(id_id==94)||(id_id==102)||(id_id==106)||(id_id==110)||(id_id==118)||(id_id==127)||(id_id==215)||(id_id==216)||(id_id==224)||(id_id==239)||(id_id==244)||(id_id==245)||(id_id==284))&&(document.getElementById('vopros_'+id_id).value!=1))//e4_impulsiv_skala
	              {
				    e4_impulsiv_skala++;
				    document.getElementById('nazv_4').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==8)||(id_id==20)||(id_id==37)||(id_id==82)||(id_id==91)||(id_id==96)||(id_id==107)||(id_id==134)||(id_id==137)||(id_id==141)||(id_id==155)||(id_id==170)||(id_id==171)||(id_id==173)||(id_id==180)||(id_id==183)||(id_id==201)||(id_id==231)||(id_id==235)||(id_id==237)||(id_id==248)||(id_id==267)||(id_id==287)||(id_id==289)||(id_id==294)||(id_id==296)))
                   {
				     e4_impulsiv_skala--;
					 document.getElementById('nazv_4').style.color="green";
					}
			   //e4_impulsiv_skala

			   //e5_genst_skala
			   //Полож ответы
			   if(((id_id==4)||(id_id==25)||(id_id==69)||(id_id==70)||(id_id==74)||(id_id==77)||(id_id==78)||(id_id==87)||(id_id==92)||(id_id==126)||(id_id==132)||(id_id==134)||(id_id==140)||(id_id==149)||(id_id==179)||(id_id==187)||(id_id==203)||(id_id==204)||(id_id==217)||(id_id==226)||(id_id==231)||(id_id==239)||(id_id==261)||(id_id==278)||(id_id==282)||(id_id==295)||(id_id==297)||(id_id==299))&&(document.getElementById('vopros_'+id_id).value!=1))//e4_impulsiv_skala
	               {
				    e5_genst_skala++;
				    document.getElementById('nazv_5').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==1)||(id_id==19)||(id_id==26)||(id_id==28)||(id_id==79)||(id_id==80)||(id_id==81)||(id_id==89)||(id_id==99)||(id_id==112)||(id_id==115)||(id_id==116)||(id_id==117)||(id_id==120)||(id_id==133)||(id_id==144)||(id_id==176)||(id_id==198)||(id_id==213)||(id_id==214)||(id_id==219)||(id_id==221)||(id_id==223)||(id_id==229)||(id_id==249)||(id_id==254)||(id_id==260)||(id_id==262)||(id_id==264)||(id_id==280)||(id_id==283)||(id_id==300)))
                   {
				     e5_genst_skala--;
					 document.getElementById('nazv_5').style.color="green";
					}
			   //e5_genst_skala

			   //e6_rigidnost_skala
			   //Полож ответы
			   if(((id_id==15)||(id_id==16)||(id_id==22)||(id_id==24)||(id_id==27)||(id_id==35)||(id_id==110)||(id_id==121)||(id_id==123)||(id_id==127)||(id_id==151)||(id_id==157)||(id_id==158)||(id_id==202)||(id_id==275)||(id_id==284)||(id_id==291)||(id_id==293)||(id_id==299)||(id_id==305)||(id_id==317)||(id_id==338)||(id_id==341)||(id_id==364)||(id_id==365))&&(document.getElementById('vopros_'+id_id).value!=1))//e4_impulsiv_skala
	              {
				    e6_rigidnost_skala++;
				    document.getElementById('nazv_6').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==93)||(id_id==107)||(id_id==109)||(id_id==111)||(id_id==117)||(id_id==124)||(id_id==268)||(id_id==281)||(id_id==294)||(id_id==313)||(id_id==316)||(id_id==319)||(id_id==327)||(id_id==347)||(id_id==348)))
                   {
				     e6_rigidnost_skala--;
					 document.getElementById('nazv_6').style.color="green";
					}
			   //e6_rigidnost_skala

			   //e7_trevoga_skala
			   //Полож ответы
			   if(((id_id==10)||(id_id==15)||(id_id==22)||(id_id==32)||(id_id==41)||(id_id==67)||(id_id==76)||(id_id==86)||(id_id==94)||(id_id==102)||(id_id==106)||(id_id==142)||(id_id==159)||(id_id==182)||(id_id==189)||(id_id==217)||(id_id==238)||(id_id==266)||(id_id==301)||(id_id==304)||(id_id==305)||(id_id==317)||(id_id==321)||(id_id==336)||(id_id==337)||(id_id==340)||(id_id==342)||(id_id==343)||(id_id==344)||(id_id==346)||(id_id==349)||(id_id==351)||(id_id==352)||(id_id==356)||(id_id==357)||(id_id==359)||(id_id==360)||(id_id==361))&&(document.getElementById('vopros_'+id_id).value!=1))//e4_impulsiv_skala
	               {
				    e7_trevoga_skala++;
				    document.getElementById('nazv_7').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==3)||(id_id==8)||(id_id==36)||(id_id==122)||(id_id==152)||(id_id==164)||(id_id==178)||(id_id==329)||(id_id==353)))
                   {
				     e7_trevoga_skala--;
					 document.getElementById('nazv_7').style.color="green";
					}
			   //e7_trevoga_skala

			   //e8_individ_skala
			   //Полож ответы
			   if(((id_id==15)||(id_id==16)||(id_id==21)||(id_id==22)||(id_id==24)||(id_id==32)||(id_id==33)||(id_id==35)||(id_id==38)||(id_id==40)||(id_id==41)||(id_id==47)||(id_id==52)||(id_id==76)||(id_id==97)||(id_id==104)||(id_id==121)||(id_id==156)||(id_id==157)||(id_id==159)||(id_id==168)||(id_id==179)||(id_id==182)||(id_id==194)||(id_id==202)||(id_id==210)||(id_id==212)||(id_id==238)||(id_id==241)||(id_id==251)||(id_id==259)||(id_id==266)||(id_id==273)||(id_id==282)||(id_id==291)||(id_id==297)||(id_id==301)||(id_id==303)||(id_id==305)||(id_id==307)||(id_id==312)||(id_id==320)||(id_id==324)||(id_id==325)||(id_id==332)||(id_id==334)||(id_id==335)||(id_id==339)||(id_id==341)||(id_id==345)||(id_id==349)||(id_id==350)||(id_id==352)||(id_id==354)||(id_id==355)||(id_id==356)||(id_id==360)||(id_id==363)||(id_id==364))&&(document.getElementById('vopros_'+id_id).value!=1))//e4_impulsiv_skala
	               {
				    e8_individ_skala++;
				    document.getElementById('nazv_8').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==8)||(id_id==17)||(id_id==20)||(id_id==37)||(id_id==65)||(id_id==103)||(id_id==119)||(id_id==177)||(id_id==178)||(id_id==187)||(id_id==192)||(id_id==196)||(id_id==220)||(id_id==276)||(id_id==281)||(id_id==306)||(id_id==309)||(id_id==322)||(id_id==330)))
                   {
				     e8_individ_skala--;
					 document.getElementById('nazv_8').style.color="green";
					}
			   //e8_individ_skala

			   //e9_optimist_skala
			   //Полож ответы
			   if(((id_id==11)||(id_id==13)||(id_id==21)||(id_id==22)||(id_id==59)||(id_id==64)||(id_id==73)||(id_id==97)||(id_id==100)||(id_id==109)||(id_id==127)||(id_id==134)||(id_id==143)||(id_id==156)||(id_id==157)||(id_id==167)||(id_id==181)||(id_id==194)||(id_id==212)||(id_id==222)||(id_id==226)||(id_id==228)||(id_id==232)||(id_id==233)||(id_id==238)||(id_id==240)||(id_id==250)||(id_id==251)||(id_id==263)||(id_id==266)||(id_id==268)||(id_id==271)||(id_id==277)||(id_id==279)||(id_id==298))&&(document.getElementById('vopros_'+id_id).value!=1))//e9_optimist_skala
	               {
				    e9_optimist_skala++;
				    document.getElementById('nazv_9').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==101)||(id_id==105)||(id_id==111)||(id_id==119)||(id_id==120)||(id_id==148)||(id_id==166)||(id_id==171)||(id_id==180)||(id_id==267)||(id_id==289)))
                   {
				     e9_optimist_skala--;
					 document.getElementById('nazv_9').style.color="green";
					}
			   //e9_optimist_skala

			   //e0_introversia_skala
			   //Полож ответы
			   if(((id_id==32)||(id_id==67)||(id_id==82)||(id_id==111)||(id_id==117)||(id_id==124)||(id_id==138)||(id_id==147)||(id_id==171)||(id_id==172)||(id_id==180)||(id_id==201)||(id_id==236)||(id_id==267)||(id_id==278)||(id_id==292)||(id_id==304)||(id_id==316)||(id_id==321)||(id_id==332)||(id_id==336)||(id_id==342)||(id_id==357)||(id_id==377)||(id_id==383)||(id_id==398)||(id_id==411)||(id_id==427)||(id_id==436)||(id_id==455)||(id_id==473)||(id_id==487)||(id_id==549)||(id_id==564))&&(document.getElementById('vopros_'+id_id).value!=1))//e9_optimist_skala
	               {
				    e0_introversia_skala++;
				    document.getElementById('nazv_0').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==25)||(id_id==33)||(id_id==57)||(id_id==91)||(id_id==99)||(id_id==119)||(id_id==126)||(id_id==143)||(id_id==193)||(id_id==208)||(id_id==229)||(id_id==231)||(id_id==254)||(id_id==262)||(id_id==281)||(id_id==296)||(id_id==309)||(id_id==353)||(id_id==359)||(id_id==371)||(id_id==391)||(id_id==400)||(id_id==415)||(id_id==440)||(id_id==446)||(id_id==449)||(id_id==450)||(id_id==451)||(id_id==462)||(id_id==469)||(id_id==479)||(id_id==481)||(id_id==482)||(id_id==501)||(id_id==521)||(id_id==547)))

				   {
				     e0_introversia_skala--;
					 document.getElementById('nazv_0').style.color="green";
					}
			   //e0_introversia_skala

			   //k_korrekc_skala
			   //Полож ответы
			   if(((id_id==96))&&(document.getElementById('vopros_'+id_id).value!=1))//k_korrekc_skala
			      {
				    k_korrekc_skala++;
				    document.getElementById('nazv_k').style.color="red";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==30)||(id_id==39)||(id_id==71)||(id_id==89)||(id_id==124)||(id_id==129)||(id_id==134)||(id_id==138)||(id_id==142)||(id_id==148)||(id_id==160)||(id_id==170)||(id_id==171)||(id_id==180)||(id_id==183)||(id_id==217)||(id_id==234)||(id_id==267)||(id_id==272)||(id_id==316)||(id_id==322)||(id_id==374)||(id_id==383)||(id_id==397)||(id_id==398)||(id_id==406)||(id_id==461)||(id_id==502)))
                   {
				     k_korrekc_skala--;
					 document.getElementById('nazv_k').style.color="green";
					}
			   //k_korrekc_skala
			   if(document.getElementById('ispr_'+id_id).value=='0')
				            {
					         document.getElementById('ispr_'+id_id).value='200';

							}
			   //? Шкала
			   if(document.getElementById('vopros_'+id_id).value==3)
			       {
				    enez_skala--;
				    }
				//? Шкала
			   document.getElementById('vopros_'+id_id).value=1;
			   document.getElementById(id_id+'_net').style.background="#D7F6B6";
			   document.getElementById(id_id+'_neznay').style.background="#D7F6B6";
			   }


			if(net==1)
			  {
			   document.getElementById('nez_'+id_id).style.backgroundColor="white";
			   document.getElementById('net_'+id_id).innerHTML="<img src='img/2.gif'>";
			   //l_log_skala
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==15)||(id_id==30)||(id_id==45)||(id_id==75)||(id_id==105)||(id_id==135)||(id_id==195)||(id_id==225)||(id_id==255)||(id_id==285)||(id_id==60)||(id_id==90)||(id_id==120)||(id_id==150)||(id_id==165)))
                    {
				     l_log_skala++;
					 document.getElementById('nazv_l').style.color="red";
					}
			   //l_log_skala

			   //f_dost_skala
			   //Полож ответы
			   if(((id_id==14)||(id_id==23)||(id_id==27)||(id_id==31)||(id_id==33)||(id_id==34)||(id_id==35)||(id_id==40)||(id_id==42)||(id_id==48)||(id_id==49)||(id_id==50)||(id_id==53)||(id_id==56)||(id_id==66)||(id_id==85)||(id_id==121)||(id_id==123)||(id_id==139)||(id_id==146)||(id_id==151)||(id_id==156)||(id_id==168)||(id_id==184)||(id_id==197)||(id_id==200)||(id_id==202)||(id_id==205)||(id_id==206)||(id_id==209)||(id_id==210)||(id_id==211)||(id_id==215)||(id_id==218)||(id_id==227)||(id_id==245)||(id_id==246)||(id_id==247)||(id_id==252)||(id_id==256)||(id_id==269)||(id_id==275)||(id_id==286)||(id_id==291)||(id_id==293))&&(document.getElementById('vopros_'+id_id).value==1))//f_dost_skala
			      {
				    f_dost_skala--;
				    document.getElementById('nazv_f').style.color="green";
				   }
                //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==17)||(id_id==20)||(id_id==54)||(id_id==65)||(id_id==75)||(id_id==83)||(id_id==112)||(id_id==113)||(id_id==115)||(id_id==164)||(id_id==169)||(id_id==177)||(id_id==185)||(id_id==196)||(id_id==199)||(id_id==220)||(id_id==257)||(id_id==258)||(id_id==272)||(id_id==276)))

				   {
				     f_dost_skala++;
					 document.getElementById('nazv_f').style.color="red";
					}

				//f_dost_skala



				//e1_sverhkontr_skala
			   //Полож ответы
			   if(((id_id==23)||(id_id==29)||(id_id==43)||(id_id==62)||(id_id==72)||(id_id==108)||(id_id==114)||(id_id==125)||(id_id==161)||(id_id==189)||(id_id==273))&&(document.getElementById('vopros_'+id_id).value==1))//e1_sverhkontr_skala
			      {
				    e1_sverhkontr_skala--;
				    document.getElementById('nazv_1').style.color="green";
				   }
                //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==2)||(id_id==3)||(id_id==7)||(id_id==9)||(id_id==18)||(id_id==51)||(id_id==55)||(id_id==63)||(id_id==68)||(id_id==103)||(id_id==130)||(id_id==153)||(id_id==155)||(id_id==163)||(id_id==175)||(id_id==188)||(id_id==190)||(id_id==192)||(id_id==230)||(id_id==243)||(id_id==274)||(id_id==281)))

				   {
				     e1_sverhkontr_skala++;
					 document.getElementById('nazv_1').style.color="red";
					}

				//e1_sverhkontr_skala

			   //e2_pissim_skala=0;
			   //Полож ответы
			   if(((id_id==5)||(id_id==13)||(id_id==23)||(id_id==32)||(id_id==41)||(id_id==43)||(id_id==52)||(id_id==67)||(id_id==86)||(id_id==104)||(id_id==130)||(id_id==138)||(id_id==142)||(id_id==158)||(id_id==159)||(id_id==182)||(id_id==189)||(id_id==193)||(id_id==236)||(id_id==259))&&(document.getElementById('vopros_'+id_id).value==1))//

				  {
				    e2_pissim_skala--;
				    document.getElementById('nazv_2').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==2)||(id_id==8)||(id_id==9)||(id_id==18)||(id_id==30)||(id_id==36)||(id_id==39)||(id_id==46)||(id_id==51)||(id_id==57)||(id_id==58)||(id_id==64)||(id_id==80)||(id_id==88)||(id_id==89)||(id_id==95)||(id_id==98)||(id_id==107)||(id_id==122)||(id_id==131)||(id_id==145)||(id_id==152)||(id_id==153)||(id_id==154)||(id_id==155)||(id_id==160)||(id_id==178)||(id_id==191)||(id_id==207)||(id_id==208)||(id_id==238)||(id_id==241)||(id_id==242)||(id_id==248)||(id_id==263)||(id_id==270)||(id_id==271)||(id_id==272)||(id_id==285)||(id_id==296)))

				   {
				     e2_pissim_skala++;
					 document.getElementById('nazv_2').style.color="red";
					}
			   //e2_pissim_skala=0;

			   //e3_emoc_lab_skala
			   //Полож ответы
			   if(((id_id==10)||(id_id==23)||(id_id==32)||(id_id==43)||(id_id==44)||(id_id==47)||(id_id==76)||(id_id==114)||(id_id==179)||(id_id==186)||(id_id==189)||(id_id==238))&&(document.getElementById('vopros_'+id_id).value==1))//e3_emoc_lab_skala
	              {
				    e3_emoc_lab_skala--;
				    document.getElementById('nazv_3').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==2)||(id_id==3)||(id_id==6)||(id_id==7)||(id_id==8)||(id_id==9)||(id_id==12)||(id_id==26)||(id_id==30)||(id_id==51)||(id_id==55)||(id_id==71)||(id_id==89)||(id_id==93)||(id_id==103)||(id_id==107)||(id_id==109)||(id_id==124)||(id_id==128)||(id_id==129)||(id_id==136)||(id_id==137)||(id_id==141)||(id_id==147)||(id_id==153)||(id_id==160)||(id_id==162)||(id_id==163)||(id_id==170)||(id_id==172)||(id_id==174)||(id_id==175)||(id_id==180)||(id_id==188)||(id_id==190)||(id_id==192)||(id_id==201)||(id_id==213)||(id_id==230)||(id_id==234)||(id_id==243)||(id_id==265)||(id_id==267)||(id_id==274)||(id_id==279)||(id_id==289)||(id_id==292)))
                   {
				     e3_emoc_lab_skala++;
					 document.getElementById('nazv_3').style.color="red";
					}
			   //e3_emoc_lab_skala

			   //e4_impulsiv_skala
			   //Полож ответы
			   if(((id_id==16)||(id_id==21)||(id_id==24)||(id_id==32)||(id_id==33)||(id_id==35)||(id_id==36)||(id_id==42)||(id_id==61)||(id_id==67)||(id_id==84)||(id_id==94)||(id_id==102)||(id_id==106)||(id_id==110)||(id_id==118)||(id_id==127)||(id_id==215)||(id_id==216)||(id_id==224)||(id_id==239)||(id_id==244)||(id_id==245)||(id_id==284))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	              {
				    e4_impulsiv_skala--;
				    document.getElementById('nazv_4').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==8)||(id_id==20)||(id_id==37)||(id_id==82)||(id_id==91)||(id_id==96)||(id_id==107)||(id_id==134)||(id_id==137)||(id_id==141)||(id_id==155)||(id_id==170)||(id_id==171)||(id_id==173)||(id_id==180)||(id_id==183)||(id_id==201)||(id_id==231)||(id_id==235)||(id_id==237)||(id_id==248)||(id_id==267)||(id_id==287)||(id_id==289)||(id_id==294)||(id_id==296)))
                   {
				     e4_impulsiv_skala++;
					 document.getElementById('nazv_4').style.color="red";
					}
			   //e4_impulsiv_skala

			   //e5_genst_skala
			   //Полож ответы
			   if(((id_id==4)||(id_id==25)||(id_id==69)||(id_id==70)||(id_id==74)||(id_id==77)||(id_id==78)||(id_id==87)||(id_id==92)||(id_id==126)||(id_id==132)||(id_id==134)||(id_id==140)||(id_id==149)||(id_id==179)||(id_id==187)||(id_id==203)||(id_id==204)||(id_id==217)||(id_id==226)||(id_id==231)||(id_id==239)||(id_id==261)||(id_id==278)||(id_id==282)||(id_id==295)||(id_id==297)||(id_id==299))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	               {
				    e5_genst_skala--;
				    document.getElementById('nazv_5').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==1)||(id_id==19)||(id_id==26)||(id_id==28)||(id_id==79)||(id_id==80)||(id_id==81)||(id_id==89)||(id_id==99)||(id_id==112)||(id_id==115)||(id_id==116)||(id_id==117)||(id_id==120)||(id_id==133)||(id_id==144)||(id_id==176)||(id_id==198)||(id_id==213)||(id_id==214)||(id_id==219)||(id_id==221)||(id_id==223)||(id_id==229)||(id_id==249)||(id_id==254)||(id_id==260)||(id_id==262)||(id_id==264)||(id_id==280)||(id_id==283)||(id_id==300)))
                   {
				     e5_genst_skala++;
					 document.getElementById('nazv_5').style.color="red";
					}
			   //e5_genst_skala


			   //e6_rigidnost_skala
			   //Полож ответы
			   if(((id_id==15)||(id_id==16)||(id_id==22)||(id_id==24)||(id_id==27)||(id_id==35)||(id_id==110)||(id_id==121)||(id_id==123)||(id_id==127)||(id_id==151)||(id_id==157)||(id_id==158)||(id_id==202)||(id_id==275)||(id_id==284)||(id_id==291)||(id_id==293)||(id_id==299)||(id_id==305)||(id_id==317)||(id_id==338)||(id_id==341)||(id_id==364)||(id_id==365))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	              {
				    e6_rigidnost_skala--;
				    document.getElementById('nazv_6').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==93)||(id_id==107)||(id_id==109)||(id_id==111)||(id_id==117)||(id_id==124)||(id_id==268)||(id_id==281)||(id_id==294)||(id_id==313)||(id_id==316)||(id_id==319)||(id_id==327)||(id_id==347)||(id_id==348)))
                   {
				     e6_rigidnost_skala++;
					 document.getElementById('nazv_6').style.color="red";
					}
			   //e6_rigidnost_skala

			   //e7_trevoga_skala
			   //Полож ответы
			   if(((id_id==10)||(id_id==15)||(id_id==22)||(id_id==32)||(id_id==41)||(id_id==67)||(id_id==76)||(id_id==86)||(id_id==94)||(id_id==102)||(id_id==106)||(id_id==142)||(id_id==159)||(id_id==182)||(id_id==189)||(id_id==217)||(id_id==238)||(id_id==266)||(id_id==301)||(id_id==304)||(id_id==305)||(id_id==317)||(id_id==321)||(id_id==336)||(id_id==337)||(id_id==340)||(id_id==342)||(id_id==343)||(id_id==344)||(id_id==346)||(id_id==349)||(id_id==351)||(id_id==352)||(id_id==356)||(id_id==357)||(id_id==359)||(id_id==360)||(id_id==361))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	               {
				    e7_trevoga_skala--;
				    document.getElementById('nazv_7').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==3)||(id_id==8)||(id_id==36)||(id_id==122)||(id_id==152)||(id_id==164)||(id_id==178)||(id_id==329)||(id_id==353)))
                   {
				     e7_trevoga_skala++;
					document.getElementById('nazv_7').style.color="red";
					}
			   //e7_trevoga_skala

			   //e8_individ_skala
			   //Полож ответы
			   if(((id_id==15)||(id_id==16)||(id_id==21)||(id_id==22)||(id_id==24)||(id_id==32)||(id_id==33)||(id_id==35)||(id_id==38)||(id_id==40)||(id_id==41)||(id_id==47)||(id_id==52)||(id_id==76)||(id_id==97)||(id_id==104)||(id_id==121)||(id_id==156)||(id_id==157)||(id_id==159)||(id_id==168)||(id_id==179)||(id_id==182)||(id_id==194)||(id_id==202)||(id_id==210)||(id_id==212)||(id_id==238)||(id_id==241)||(id_id==251)||(id_id==259)||(id_id==266)||(id_id==273)||(id_id==282)||(id_id==291)||(id_id==297)||(id_id==301)||(id_id==303)||(id_id==305)||(id_id==307)||(id_id==312)||(id_id==320)||(id_id==324)||(id_id==325)||(id_id==332)||(id_id==334)||(id_id==335)||(id_id==339)||(id_id==341)||(id_id==345)||(id_id==349)||(id_id==350)||(id_id==352)||(id_id==354)||(id_id==355)||(id_id==356)||(id_id==360)||(id_id==363)||(id_id==364))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	               {
				    e8_individ_skala--;
				    document.getElementById('nazv_8').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==8)||(id_id==17)||(id_id==20)||(id_id==37)||(id_id==65)||(id_id==103)||(id_id==119)||(id_id==177)||(id_id==178)||(id_id==187)||(id_id==192)||(id_id==196)||(id_id==220)||(id_id==276)||(id_id==281)||(id_id==306)||(id_id==309)||(id_id==322)||(id_id==330)))
                   {
				     e8_individ_skala++;
					 document.getElementById('nazv_8').style.color="red";
					}
			   //e8_individ_skala

			   //e9_optimist_skala
			   //Полож ответы
			   if(((id_id==11)||(id_id==13)||(id_id==21)||(id_id==22)||(id_id==59)||(id_id==64)||(id_id==73)||(id_id==97)||(id_id==100)||(id_id==109)||(id_id==127)||(id_id==134)||(id_id==143)||(id_id==156)||(id_id==157)||(id_id==167)||(id_id==181)||(id_id==194)||(id_id==212)||(id_id==222)||(id_id==226)||(id_id==228)||(id_id==232)||(id_id==233)||(id_id==238)||(id_id==240)||(id_id==250)||(id_id==251)||(id_id==263)||(id_id==266)||(id_id==268)||(id_id==271)||(id_id==277)||(id_id==279)||(id_id==298))&&(document.getElementById('vopros_'+id_id).value==1))//e9_optimist_skala
	               {
				    e9_optimist_skala--;
				    document.getElementById('nazv_9').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==101)||(id_id==105)||(id_id==111)||(id_id==119)||(id_id==120)||(id_id==148)||(id_id==166)||(id_id==171)||(id_id==180)||(id_id==267)||(id_id==289)))
                   {
				     e9_optimist_skala++;
					 document.getElementById('nazv_9').style.color="red";
					}
			   //e9_optimist_skala

			   //e0_introversia_skala
			   //Полож ответы
			   if(((id_id==32)||(id_id==67)||(id_id==82)||(id_id==111)||(id_id==117)||(id_id==124)||(id_id==138)||(id_id==147)||(id_id==171)||(id_id==172)||(id_id==180)||(id_id==201)||(id_id==236)||(id_id==267)||(id_id==278)||(id_id==292)||(id_id==304)||(id_id==316)||(id_id==321)||(id_id==332)||(id_id==336)||(id_id==342)||(id_id==357)||(id_id==377)||(id_id==383)||(id_id==398)||(id_id==411)||(id_id==427)||(id_id==436)||(id_id==455)||(id_id==473)||(id_id==487)||(id_id==549)||(id_id==564))&&(document.getElementById('vopros_'+id_id).value==1))//e9_optimist_skala
	               {
				    e0_introversia_skala--;
				    document.getElementById('nazv_0').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==25)||(id_id==33)||(id_id==57)||(id_id==91)||(id_id==99)||(id_id==119)||(id_id==126)||(id_id==143)||(id_id==193)||(id_id==208)||(id_id==229)||(id_id==231)||(id_id==254)||(id_id==262)||(id_id==281)||(id_id==296)||(id_id==309)||(id_id==353)||(id_id==359)||(id_id==371)||(id_id==391)||(id_id==400)||(id_id==415)||(id_id==440)||(id_id==446)||(id_id==449)||(id_id==450)||(id_id==451)||(id_id==462)||(id_id==469)||(id_id==479)||(id_id==481)||(id_id==482)||(id_id==501)||(id_id==521)||(id_id==547)))

				   {
				     e0_introversia_skala++;
					 document.getElementById('nazv_0').style.color="red";
					}
			   //e0_introversia_skala

			   //k_korrekc_skala
			   //Полож ответы
			   if(((id_id==96))&&(document.getElementById('vopros_'+id_id).value==1))//k_korrekc_skala
			      {
				    k_korrekc_skala--;
				    document.getElementById('nazv_k').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value!=2)&&((id_id==30)||(id_id==39)||(id_id==71)||(id_id==89)||(id_id==124)||(id_id==129)||(id_id==134)||(id_id==138)||(id_id==142)||(id_id==148)||(id_id==160)||(id_id==170)||(id_id==171)||(id_id==180)||(id_id==183)||(id_id==217)||(id_id==234)||(id_id==267)||(id_id==272)||(id_id==316)||(id_id==322)||(id_id==374)||(id_id==383)||(id_id==397)||(id_id==398)||(id_id==406)||(id_id==461)||(id_id==502)))
                   {
				     k_korrekc_skala++;
					 document.getElementById('nazv_k').style.color="red";
					}
			   //k_korrekc_skala
			   if(document.getElementById('ispr_'+id_id).value=='0')
				            {
					         document.getElementById('ispr_'+id_id).value='020';

							}

              //? Шкала
			   if(document.getElementById('vopros_'+id_id).value==3)
			       {
				    enez_skala--;
				    }
				//? Шкала
			  document.getElementById('vopros_'+id_id).value=2;
			   document.getElementById(id_id+'_da').style.background="#D7F6B6";
			   document.getElementById(id_id+'_neznay').style.background="#D7F6B6";
			   }



			 if(neznay==1)
			  {
			   //l_log_skala
			   //отриц ответы
			   document.getElementById('nez_'+id_id).style.backgroundColor="red";
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==15)||(id_id==30)||(id_id==45)||(id_id==75)||(id_id==105)||(id_id==135)||(id_id==195)||(id_id==225)||(id_id==255)||(id_id==285)||(id_id==60)||(id_id==90)||(id_id==120)||(id_id==150)||(id_id==165)))
                    {
				     l_log_skala--;
					 document.getElementById('nazv_l').style.color="green";
					}
			   //l_log_skala

			   //f_dost_skala
			   //Полож ответы
			   if(((id_id==14)||(id_id==23)||(id_id==27)||(id_id==31)||(id_id==33)||(id_id==34)||(id_id==35)||(id_id==40)||(id_id==42)||(id_id==48)||(id_id==49)||(id_id==50)||(id_id==53)||(id_id==56)||(id_id==66)||(id_id==85)||(id_id==121)||(id_id==123)||(id_id==139)||(id_id==146)||(id_id==151)||(id_id==156)||(id_id==168)||(id_id==184)||(id_id==197)||(id_id==200)||(id_id==202)||(id_id==205)||(id_id==206)||(id_id==209)||(id_id==210)||(id_id==211)||(id_id==215)||(id_id==218)||(id_id==227)||(id_id==245)||(id_id==246)||(id_id==247)||(id_id==252)||(id_id==256)||(id_id==269)||(id_id==275)||(id_id==286)||(id_id==291)||(id_id==293))&&(document.getElementById('vopros_'+id_id).value==1))//f_dost_skala
			      {
				    f_dost_skala--;
				    document.getElementById('nazv_f').style.color="green";
				   }
				//отриц ответы
				if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==17)||(id_id==20)||(id_id==54)||(id_id==65)||(id_id==75)||(id_id==83)||(id_id==112)||(id_id==113)||(id_id==115)||(id_id==164)||(id_id==169)||(id_id==177)||(id_id==185)||(id_id==196)||(id_id==199)||(id_id==220)||(id_id==257)||(id_id==258)||(id_id==272)||(id_id==276)))

				   {
				     f_dost_skala--;
					 document.getElementById('nazv_f').style.color="green";
					}

				//f_dost_skala



				//e1_sverhkontr_skala
			   //Полож ответы
			   if(((id_id==23)||(id_id==29)||(id_id==43)||(id_id==62)||(id_id==72)||(id_id==108)||(id_id==114)||(id_id==125)||(id_id==161)||(id_id==189)||(id_id==273))&&(document.getElementById('vopros_'+id_id).value==1))//e1_sverhkontr_skala
			      {
				    e1_sverhkontr_skala--;
				    document.getElementById('nazv_1').style.color="green";
				   }
				//отриц ответы
				if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==2)||(id_id==3)||(id_id==7)||(id_id==9)||(id_id==18)||(id_id==51)||(id_id==55)||(id_id==63)||(id_id==68)||(id_id==103)||(id_id==130)||(id_id==153)||(id_id==155)||(id_id==163)||(id_id==175)||(id_id==188)||(id_id==190)||(id_id==192)||(id_id==230)||(id_id==243)||(id_id==274)||(id_id==281)))

				   {
				     e1_sverhkontr_skala--;
					 document.getElementById('nazv_1').style.color="green";
					}

				//e1_sverhkontr_skala

				//e2_pissim_skala=0;
			   //Полож ответы
			   if(((id_id==5)||(id_id==13)||(id_id==23)||(id_id==32)||(id_id==41)||(id_id==43)||(id_id==52)||(id_id==67)||(id_id==86)||(id_id==104)||(id_id==130)||(id_id==138)||(id_id==142)||(id_id==158)||(id_id==159)||(id_id==182)||(id_id==189)||(id_id==193)||(id_id==236)||(id_id==259))&&(document.getElementById('vopros_'+id_id).value==1))

				  {
				    e2_pissim_skala--;
				    document.getElementById('nazv_2').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==2)||(id_id==8)||(id_id==9)||(id_id==18)||(id_id==30)||(id_id==36)||(id_id==39)||(id_id==46)||(id_id==51)||(id_id==57)||(id_id==58)||(id_id==64)||(id_id==80)||(id_id==88)||(id_id==89)||(id_id==95)||(id_id==98)||(id_id==107)||(id_id==122)||(id_id==131)||(id_id==145)||(id_id==152)||(id_id==153)||(id_id==154)||(id_id==155)||(id_id==160)||(id_id==178)||(id_id==191)||(id_id==207)||(id_id==208)||(id_id==238)||(id_id==241)||(id_id==242)||(id_id==248)||(id_id==263)||(id_id==270)||(id_id==271)||(id_id==272)||(id_id==285)||(id_id==296)))

				   {
				     e2_pissim_skala--;
					 document.getElementById('nazv_2').style.color="green";
					}
			   //e2_pissim_skala=0;

				//e3_emoc_lab_skala
			   //Полож ответы
			   if(((id_id==10)||(id_id==23)||(id_id==32)||(id_id==43)||(id_id==44)||(id_id==47)||(id_id==76)||(id_id==114)||(id_id==179)||(id_id==186)||(id_id==189)||(id_id==238))&&(document.getElementById('vopros_'+id_id).value==1))//e3_emoc_lab_skala
	              {
				    e3_emoc_lab_skala--;
				    document.getElementById('nazv_3').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==2)||(id_id==3)||(id_id==6)||(id_id==7)||(id_id==8)||(id_id==9)||(id_id==12)||(id_id==26)||(id_id==30)||(id_id==51)||(id_id==55)||(id_id==71)||(id_id==89)||(id_id==93)||(id_id==103)||(id_id==107)||(id_id==109)||(id_id==124)||(id_id==128)||(id_id==129)||(id_id==136)||(id_id==137)||(id_id==141)||(id_id==147)||(id_id==153)||(id_id==160)||(id_id==162)||(id_id==163)||(id_id==170)||(id_id==172)||(id_id==174)||(id_id==175)||(id_id==180)||(id_id==188)||(id_id==190)||(id_id==192)||(id_id==201)||(id_id==213)||(id_id==230)||(id_id==234)||(id_id==243)||(id_id==265)||(id_id==267)||(id_id==274)||(id_id==279)||(id_id==289)||(id_id==292)))
                   {
				     e3_emoc_lab_skala--;
					 document.getElementById('nazv_3').style.color="green";
					}
			   //e3_emoc_lab_skala

				//e4_impulsiv_skala
			   //Полож ответы
			   if(((id_id==16)||(id_id==21)||(id_id==24)||(id_id==32)||(id_id==33)||(id_id==35)||(id_id==36)||(id_id==42)||(id_id==61)||(id_id==67)||(id_id==84)||(id_id==94)||(id_id==102)||(id_id==106)||(id_id==110)||(id_id==118)||(id_id==127)||(id_id==215)||(id_id==216)||(id_id==224)||(id_id==239)||(id_id==244)||(id_id==245)||(id_id==284))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	              {
				    e4_impulsiv_skala--;
				    document.getElementById('nazv_4').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==8)||(id_id==20)||(id_id==37)||(id_id==82)||(id_id==91)||(id_id==96)||(id_id==107)||(id_id==134)||(id_id==137)||(id_id==141)||(id_id==155)||(id_id==170)||(id_id==171)||(id_id==173)||(id_id==180)||(id_id==183)||(id_id==201)||(id_id==231)||(id_id==235)||(id_id==237)||(id_id==248)||(id_id==267)||(id_id==287)||(id_id==289)||(id_id==294)||(id_id==296)))
                   {
				     e4_impulsiv_skala--;
					 document.getElementById('nazv_4').style.color="green";
					}
			   //e4_impulsiv_skala

				//e5_genst_skala
			   //Полож ответы
			   if(((id_id==4)||(id_id==25)||(id_id==69)||(id_id==70)||(id_id==74)||(id_id==77)||(id_id==78)||(id_id==87)||(id_id==92)||(id_id==126)||(id_id==132)||(id_id==134)||(id_id==140)||(id_id==149)||(id_id==179)||(id_id==187)||(id_id==203)||(id_id==204)||(id_id==217)||(id_id==226)||(id_id==231)||(id_id==239)||(id_id==261)||(id_id==278)||(id_id==282)||(id_id==295)||(id_id==297)||(id_id==299))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	               {
				    e5_genst_skala--;
				    document.getElementById('nazv_5').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==1)||(id_id==19)||(id_id==26)||(id_id==28)||(id_id==79)||(id_id==80)||(id_id==81)||(id_id==89)||(id_id==99)||(id_id==112)||(id_id==115)||(id_id==116)||(id_id==117)||(id_id==120)||(id_id==133)||(id_id==144)||(id_id==176)||(id_id==198)||(id_id==213)||(id_id==214)||(id_id==219)||(id_id==221)||(id_id==223)||(id_id==229)||(id_id==249)||(id_id==254)||(id_id==260)||(id_id==262)||(id_id==264)||(id_id==280)||(id_id==283)||(id_id==300)))
                   {
				     e5_genst_skala--;
					 document.getElementById('nazv_5').style.color="green";
					}
				//e5_genst_skala


				//e6_rigidnost_skala
			   //Полож ответы
			   if(((id_id==15)||(id_id==16)||(id_id==22)||(id_id==24)||(id_id==27)||(id_id==35)||(id_id==110)||(id_id==121)||(id_id==123)||(id_id==127)||(id_id==151)||(id_id==157)||(id_id==158)||(id_id==202)||(id_id==275)||(id_id==284)||(id_id==291)||(id_id==293)||(id_id==299)||(id_id==305)||(id_id==317)||(id_id==338)||(id_id==341)||(id_id==364)||(id_id==365))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	              {
				    e6_rigidnost_skala--;
				    document.getElementById('nazv_6').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==93)||(id_id==107)||(id_id==109)||(id_id==111)||(id_id==117)||(id_id==124)||(id_id==268)||(id_id==281)||(id_id==294)||(id_id==313)||(id_id==316)||(id_id==319)||(id_id==327)||(id_id==347)||(id_id==348)))
                   {
				     e6_rigidnost_skala--;
					 document.getElementById('nazv_6').style.color="green";
					}
			   //e6_rigidnost_skala

				//e7_trevoga_skala
			   //Полож ответы
			   if(((id_id==10)||(id_id==15)||(id_id==22)||(id_id==32)||(id_id==41)||(id_id==67)||(id_id==76)||(id_id==86)||(id_id==94)||(id_id==102)||(id_id==106)||(id_id==142)||(id_id==159)||(id_id==182)||(id_id==189)||(id_id==217)||(id_id==238)||(id_id==266)||(id_id==301)||(id_id==304)||(id_id==305)||(id_id==317)||(id_id==321)||(id_id==336)||(id_id==337)||(id_id==340)||(id_id==342)||(id_id==343)||(id_id==344)||(id_id==346)||(id_id==349)||(id_id==351)||(id_id==352)||(id_id==356)||(id_id==357)||(id_id==359)||(id_id==360)||(id_id==361))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	               {
				    e7_trevoga_skala--;
				    document.getElementById('nazv_7').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==3)||(id_id==8)||(id_id==36)||(id_id==122)||(id_id==152)||(id_id==164)||(id_id==178)||(id_id==329)||(id_id==353)))
                   {
				     e7_trevoga_skala--;
					 document.getElementById('nazv_7').style.color="green";
					}
			   //e7_trevoga_skala

				//e8_individ_skala
			   //Полож ответы
			   if(((id_id==15)||(id_id==16)||(id_id==21)||(id_id==22)||(id_id==24)||(id_id==32)||(id_id==33)||(id_id==35)||(id_id==38)||(id_id==40)||(id_id==41)||(id_id==47)||(id_id==52)||(id_id==76)||(id_id==97)||(id_id==104)||(id_id==121)||(id_id==156)||(id_id==157)||(id_id==159)||(id_id==168)||(id_id==179)||(id_id==182)||(id_id==194)||(id_id==202)||(id_id==210)||(id_id==212)||(id_id==238)||(id_id==241)||(id_id==251)||(id_id==259)||(id_id==266)||(id_id==273)||(id_id==282)||(id_id==291)||(id_id==297)||(id_id==301)||(id_id==303)||(id_id==305)||(id_id==307)||(id_id==312)||(id_id==320)||(id_id==324)||(id_id==325)||(id_id==332)||(id_id==334)||(id_id==335)||(id_id==339)||(id_id==341)||(id_id==345)||(id_id==349)||(id_id==350)||(id_id==352)||(id_id==354)||(id_id==355)||(id_id==356)||(id_id==360)||(id_id==363)||(id_id==364))&&(document.getElementById('vopros_'+id_id).value==1))//e4_impulsiv_skala
	               {
				    e8_individ_skala--;
				    document.getElementById('nazv_8').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==8)||(id_id==17)||(id_id==20)||(id_id==37)||(id_id==65)||(id_id==103)||(id_id==119)||(id_id==177)||(id_id==178)||(id_id==187)||(id_id==192)||(id_id==196)||(id_id==220)||(id_id==276)||(id_id==281)||(id_id==306)||(id_id==309)||(id_id==322)||(id_id==330)))
                   {
				     e8_individ_skala--;
					 document.getElementById('nazv_8').style.color="green";
					}
			   //e8_individ_skala

				//e9_optimist_skala
			   //Полож ответы
			   if(((id_id==11)||(id_id==13)||(id_id==21)||(id_id==22)||(id_id==59)||(id_id==64)||(id_id==73)||(id_id==97)||(id_id==100)||(id_id==109)||(id_id==127)||(id_id==134)||(id_id==143)||(id_id==156)||(id_id==157)||(id_id==167)||(id_id==181)||(id_id==194)||(id_id==212)||(id_id==222)||(id_id==226)||(id_id==228)||(id_id==232)||(id_id==233)||(id_id==238)||(id_id==240)||(id_id==250)||(id_id==251)||(id_id==263)||(id_id==266)||(id_id==268)||(id_id==271)||(id_id==277)||(id_id==279)||(id_id==298))&&(document.getElementById('vopros_'+id_id).value==1))//e9_optimist_skala
	               {
				    e9_optimist_skala--;
				    document.getElementById('nazv_9').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==101)||(id_id==105)||(id_id==111)||(id_id==119)||(id_id==120)||(id_id==148)||(id_id==166)||(id_id==171)||(id_id==180)||(id_id==267)||(id_id==289)))
                   {
				     e9_optimist_skala--;
					 document.getElementById('nazv_9').style.color="green";
					}
			   //e9_optimist_skala

				//e0_introversia_skala
			   //Полож ответы
			   if(((id_id==32)||(id_id==67)||(id_id==82)||(id_id==111)||(id_id==117)||(id_id==124)||(id_id==138)||(id_id==147)||(id_id==171)||(id_id==172)||(id_id==180)||(id_id==201)||(id_id==236)||(id_id==267)||(id_id==278)||(id_id==292)||(id_id==304)||(id_id==316)||(id_id==321)||(id_id==332)||(id_id==336)||(id_id==342)||(id_id==357)||(id_id==377)||(id_id==383)||(id_id==398)||(id_id==411)||(id_id==427)||(id_id==436)||(id_id==455)||(id_id==473)||(id_id==487)||(id_id==549)||(id_id==564))&&(document.getElementById('vopros_'+id_id).value==1))//e9_optimist_skala
	               {
				    e0_introversia_skala--;
				    document.getElementById('nazv_0').style.color="green";
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==25)||(id_id==33)||(id_id==57)||(id_id==91)||(id_id==99)||(id_id==119)||(id_id==126)||(id_id==143)||(id_id==193)||(id_id==208)||(id_id==229)||(id_id==231)||(id_id==254)||(id_id==262)||(id_id==281)||(id_id==296)||(id_id==309)||(id_id==353)||(id_id==359)||(id_id==371)||(id_id==391)||(id_id==400)||(id_id==415)||(id_id==440)||(id_id==446)||(id_id==449)||(id_id==450)||(id_id==451)||(id_id==462)||(id_id==469)||(id_id==479)||(id_id==481)||(id_id==482)||(id_id==501)||(id_id==521)||(id_id==547)))

				   {
				     e0_introversia_skala--;
					 document.getElementById('nazv_0').style.color="green";
					}
			   //e0_introversia_skala

				//k_korrekc_skala
			   //Полож ответы
			   if(((id_id==96))&&(document.getElementById('vopros_'+id_id).value==1))//k_korrekc_skala
			      {
				    k_korrekc_skala--;
				   }
			   //отриц ответы
			   if((document.getElementById('vopros_'+id_id).value==2)&&((id_id==30)||(id_id==39)||(id_id==71)||(id_id==89)||(id_id==124)||(id_id==129)||(id_id==134)||(id_id==138)||(id_id==142)||(id_id==148)||(id_id==160)||(id_id==170)||(id_id==171)||(id_id==180)||(id_id==183)||(id_id==217)||(id_id==234)||(id_id==267)||(id_id==272)||(id_id==316)||(id_id==322)||(id_id==374)||(id_id==383)||(id_id==397)||(id_id==398)||(id_id==406)||(id_id==461)||(id_id==502)))
                   {
				     k_korrekc_skala--;
					}
			   //k_korrekc_skala
				if(document.getElementById('ispr_'+id_id).value=='0')
				            {
					         document.getElementById('ispr_'+id_id).value='002';

							}
			   //
			   //? Шкала

				    enez_skala++;

				//? Шкала

			   document.getElementById('vopros_'+id_id).value=3;
			   document.getElementById(id_id+'_net').style.background="#D7F6B6";
			   document.getElementById(id_id+'_da').style.background="#D7F6B6";
			   }
			t_ball_l_log_skala=50+((10*(l_log_skala-4.2))/2.9);//Расчитываем T-балл l шкалы без коррекции
			t_ball_f_dost_skala=50+((10*(f_dost_skala-2.76))/4.67);//Расчитываем T-балл f шкалы без коррекции
			//e1_sverhkontr_skala=e1_sverhkontr_skala+(k_korrekc_skala*0.5);//Коррекция первой шкалы прибавляем 0,5 сырых балов шкалы коррекции
			t_ball_e1_sverhkontr_skala=50+(10*((e1_sverhkontr_skala+(k_korrekc_skala*0.5))-11.1)/3.9);//Расчитываем T-балл 1 шкалы
			t_ball_e2_pissim_skala=50+((10*(e2_pissim_skala-16.6))/4.11);//Расчитываем T-балл 2 шкалы
			t_ball_e3_emoc_lab_skala=50+((10*(e3_emoc_lab_skala-16.46))/5.4);//Расчитываем T-балл 3 шкалы
			t_ball_e4_impulsiv_skala=50+(10*((e4_impulsiv_skala+(k_korrekc_skala*0.4))-18.68)/4.11);//Расчитываем T-балл 4 шкалы
			t_ball_e5_genst_skala=50+((10*(e5_genst_skala-20.46))/5);//Расчитываем T-балл 5 шкалы
			t_ball_e6_rigidnost_skala=50+((10*(e6_rigidnost_skala-7.9))/3.4);//Расчитываем T-балл 6 шкалы
			t_ball_e7_trevoga_skala=50+(10*((e7_trevoga_skala+k_korrekc_skala)-23.06)/5);//Расчитываем T-балл 7 шкалы
			t_ball_e8_individ_skala=50+(10*((e8_individ_skala+k_korrekc_skala)-21.96)/5);//Расчитываем T-балл 8 шкалы
			t_ball_e9_optimist_skala=50+(10*((e9_optimist_skala+(k_korrekc_skala*0.2))-17)/4.06);//Расчитываем T-балл 9 шкалы
			t_ball_e0_introversia_skala=50+((10*(e0_introversia_skala-25))/10);//Расчитываем T-балл 0 шкалы
			t_ball_k_korrekc_skala=50+((10*(k_korrekc_skala-12.1))/5.4);//Расчитываем T-балл 2 шкалы
			t_ball_l_log_skala=Math.round(parseFloat(t_ball_l_log_skala) * 100) / 100;//Округляем до сотых
			t_ball_f_dost_skala=Math.round(parseFloat(t_ball_f_dost_skala) * 100) / 100;//Округляем до сотых
			t_ball_e1_sverhkontr_skala=Math.round(parseFloat(t_ball_e1_sverhkontr_skala) * 100) / 100;//Округляем до сотых
			t_ball_e2_pissim_skala=Math.round(parseFloat(t_ball_e2_pissim_skala) * 100) / 100;//Округляем до сотых
			t_ball_e3_emoc_lab_skala=Math.round(parseFloat(t_ball_e3_emoc_lab_skala) * 100) / 100;//Округляем до сотых
			t_ball_e4_impulsiv_skala=Math.round(parseFloat(t_ball_e4_impulsiv_skala) * 100) / 100;//Округляем до сотых
			t_ball_e5_genst_skala=Math.round(parseFloat(t_ball_e5_genst_skala) * 100) / 100;//Округляем до сотых
			t_ball_e6_rigidnost_skala=Math.round(parseFloat(t_ball_e6_rigidnost_skala) * 100) / 100;//Округляем до сотых
			t_ball_e7_trevoga_skala=Math.round(parseFloat(t_ball_e7_trevoga_skala) * 100) / 100;//Округляем до сотых
			t_ball_e8_individ_skala=Math.round(parseFloat(t_ball_e8_individ_skala) * 100) / 100;//Округляем до сотых
			t_ball_e9_optimist_skala=Math.round(parseFloat(t_ball_e9_optimist_skala) * 100) / 100;//Округляем до сотых
			t_ball_e9_optimist_skala=Math.round(parseFloat(t_ball_e9_optimist_skala) * 100) / 100;//Округляем до сотых
			t_ball_e0_introversia_skala=Math.round(parseFloat(t_ball_e0_introversia_skala) * 100) / 100;//Округляем до сотых
			t_ball_k_korrekc_skala=Math.round(parseFloat(t_ball_k_korrekc_skala) * 100) / 100;//Округляем до сотых
			document.getElementById("pan_skala_log").innerHTML=t_ball_l_log_skala;
			document.getElementById("pan_skala_f").innerHTML=t_ball_f_dost_skala;
			document.getElementById("pan_skala_k").innerHTML=t_ball_k_korrekc_skala;
			document.getElementById("pan_skala1").innerHTML=t_ball_e1_sverhkontr_skala;
			document.getElementById("pan_skala2").innerHTML=t_ball_e2_pissim_skala;
			document.getElementById("pan_skala3").innerHTML=t_ball_e3_emoc_lab_skala;
			document.getElementById("pan_skala4").innerHTML=t_ball_e4_impulsiv_skala;
			document.getElementById("pan_skala5").innerHTML=t_ball_e5_genst_skala;
			document.getElementById("pan_skala6").innerHTML=t_ball_e6_rigidnost_skala;
			document.getElementById("pan_skala7").innerHTML=t_ball_e7_trevoga_skala;
			document.getElementById("pan_skala8").innerHTML=t_ball_e8_individ_skala;
			document.getElementById("pan_skala9").innerHTML=t_ball_e9_optimist_skala;
			document.getElementById("pan_skala0").innerHTML=t_ball_e0_introversia_skala;

			document.getElementById("sir_pan_skala_log").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(997)">'+l_log_skala+'</span>';
			document.getElementById("sir_pan_skala_f").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(998)">'+f_dost_skala+'</span>';
			document.getElementById("sir_pan_skala_k").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(999)">'+k_korrekc_skala+'</span>';
			document.getElementById("sir_pan_skala1").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1000)">'+e1_sverhkontr_skala+'</span>';
			document.getElementById("sir_pan_skala2").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1001)">'+e2_pissim_skala+'</span>';
			document.getElementById("sir_pan_skala3").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1002)">'+e3_emoc_lab_skala+'</span>';
			document.getElementById("sir_pan_skala4").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1003)">'+e4_impulsiv_skala+'</span>';
			document.getElementById("sir_pan_skala5").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1004)">'+e5_genst_skala+'</span>';
			document.getElementById("sir_pan_skala6").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1005)">'+e6_rigidnost_skala+'</span>';
			document.getElementById("sir_pan_skala7").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1006)">'+e7_trevoga_skala+'</span>';
			document.getElementById("sir_pan_skala8").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1007)">'+e8_individ_skala+'</span>';
			document.getElementById("sir_pan_skala9").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1008)">'+e9_optimist_skala+'</span>';
			document.getElementById("sir_pan_skala0").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1009)">'+e0_introversia_skala+'</span>';
			document.getElementById("sir_pan_skalaenez").innerHTML=enez_skala;
			//alert(e0_introversia_skala);
		    //alert(t_ball_f_dost_skala);

			 //Перестраиваем график
			 d1 = [];
			 d3 = [];
			 d3.push([0,t_ball_l_log_skala]);
			 d3.push([1,t_ball_f_dost_skala]);
			 d3.push([2,t_ball_k_korrekc_skala]);
			 d1.push([3,t_ball_e1_sverhkontr_skala]);
			 d1.push([4,t_ball_e2_pissim_skala]);
			 d1.push([5,t_ball_e3_emoc_lab_skala]);
			 d1.push([6,t_ball_e4_impulsiv_skala]);
			 d1.push([7,t_ball_e5_genst_skala]);
			 d1.push([8,t_ball_e6_rigidnost_skala]);
			 d1.push([9,t_ball_e7_trevoga_skala]);
			 d1.push([10,t_ball_e8_individ_skala]);
			 d1.push([11,t_ball_e9_optimist_skala]);
			 d1.push([12,t_ball_e0_introversia_skala]);
		//var d3 = [];
		//for (var i = -7; i < 7; i += 0.5)
		//{
			//d1.push([i, x * Math.sin(i)]);
			//d3.push([y + i, Math.cos(i)]);
		//}
		 //d1.push([3,f]);
		$.plot($("#placeholder"), [
			{
				data: d1,
				lines: { show: true, fill: false }, //, fill: true
				points: { show: true }
			},
			{
				data: d3,
				lines: { show: true, fill: false }, //, fill: true
                                points: { show: true }
			}
		],
		  {
		    yaxis: {
				ticks: 20,
				min: 0,
				max: 120,
				tickDecimals: 0, tickSize: 10
			},
			xaxis: {
				ticks: [
					[ 0, "L" ],
					[ 1, "F" ], [ 2, "K" ], [ 3, "1" ], [ 4, "2" ], [ 5, "3" ], [ 6, "4" ], [ 7, "5" ], [ 8, "6" ], [ 9, "7" ], [ 10, "8" ], [ 11, "9" ], [ 12, "0" ]
				],
			 min: 0,
			 max: 12
			}
		   }

		 );
	}

//Н построения графиков
$(function () {

	re_plot();

	function re_plot(f) {
		var d1 = [];
                var d3 = [];
        log_shala=0;
        l_log_skala=0;
        f_dost_skala=0;
        k_korrekc_skala=0;
        e1_sverhkontr_skala=0;
        e2_pissim_skala=0;
        e3_emoc_lab_skala=0;
        e4_impulsiv_skala=0;
        e5_genst_skala=0;
        e6_rigidnost_skala=0;//Сырые баллы
        e7_trevoga_skala=0;
        e8_individ_skala=0;
        e9_optimist_skala=0;
        e0_introversia_skala=0;
		//var x = 6;
		//var y = 8;


       
		t_ball_l_log_skala=50+((10*(l_log_skala-4.2))/2.9);//Расчитываем T-балл l шкалы без коррекции
			t_ball_f_dost_skala=50+((10*(f_dost_skala-2.76))/4.67);//Расчитываем T-балл f шкалы без коррекции
			//e1_sverhkontr_skala=e1_sverhkontr_skala+(k_korrekc_skala*0.5);//Коррекция первой шкалы прибавляем 0,5 сырых балов шкалы коррекции
			t_ball_e1_sverhkontr_skala=50+(10*((e1_sverhkontr_skala+(k_korrekc_skala*0.5))-11.1)/3.9);//Расчитываем T-балл 1 шкалы
			t_ball_e2_pissim_skala=50+((10*(e2_pissim_skala-16.6))/4.11);//Расчитываем T-балл 2 шкалы
			t_ball_e3_emoc_lab_skala=50+((10*(e3_emoc_lab_skala-16.46))/5.4);//Расчитываем T-балл 3 шкалы
			t_ball_e4_impulsiv_skala=50+(10*((e4_impulsiv_skala+(k_korrekc_skala*0.4))-18.68)/4.11);//Расчитываем T-балл 4 шкалы
			t_ball_e5_genst_skala=50+((10*(e5_genst_skala-20.46))/5);//Расчитываем T-балл 5 шкалы
			t_ball_e6_rigidnost_skala=50+((10*(e6_rigidnost_skala-7.9))/3.4);//Расчитываем T-балл 6 шкалы
			t_ball_e7_trevoga_skala=50+(10*((e7_trevoga_skala+k_korrekc_skala)-23.06)/5);//Расчитываем T-балл 7 шкалы
			t_ball_e8_individ_skala=50+(10*((e8_individ_skala+k_korrekc_skala)-21.96)/5);//Расчитываем T-балл 8 шкалы
			t_ball_e9_optimist_skala=50+(10*((e9_optimist_skala+(k_korrekc_skala*0.2))-17)/4.06);//Расчитываем T-балл 9 шкалы
			t_ball_e0_introversia_skala=50+((10*(e0_introversia_skala-25))/10);//Расчитываем T-балл 0 шкалы
			t_ball_k_korrekc_skala=50+((10*(k_korrekc_skala-12.1))/5.4);//Расчитываем T-балл 2 шкалы
			t_ball_l_log_skala=Math.round(parseFloat(t_ball_l_log_skala) * 100) / 100;//Округляем до сотых
			t_ball_f_dost_skala=Math.round(parseFloat(t_ball_f_dost_skala) * 100) / 100;//Округляем до сотых
			t_ball_e1_sverhkontr_skala=Math.round(parseFloat(t_ball_e1_sverhkontr_skala) * 100) / 100;//Округляем до сотых
			t_ball_e2_pissim_skala=Math.round(parseFloat(t_ball_e2_pissim_skala) * 100) / 100;//Округляем до сотых
			t_ball_e3_emoc_lab_skala=Math.round(parseFloat(t_ball_e3_emoc_lab_skala) * 100) / 100;//Округляем до сотых
			t_ball_e4_impulsiv_skala=Math.round(parseFloat(t_ball_e4_impulsiv_skala) * 100) / 100;//Округляем до сотых
			t_ball_e5_genst_skala=Math.round(parseFloat(t_ball_e5_genst_skala) * 100) / 100;//Округляем до сотых
			t_ball_e6_rigidnost_skala=Math.round(parseFloat(t_ball_e6_rigidnost_skala) * 100) / 100;//Округляем до сотых
			t_ball_e7_trevoga_skala=Math.round(parseFloat(t_ball_e7_trevoga_skala) * 100) / 100;//Округляем до сотых
			t_ball_e8_individ_skala=Math.round(parseFloat(t_ball_e8_individ_skala) * 100) / 100;//Округляем до сотых
			t_ball_e9_optimist_skala=Math.round(parseFloat(t_ball_e9_optimist_skala) * 100) / 100;//Округляем до сотых
			t_ball_e9_optimist_skala=Math.round(parseFloat(t_ball_e9_optimist_skala) * 100) / 100;//Округляем до сотых
			t_ball_e0_introversia_skala=Math.round(parseFloat(t_ball_e0_introversia_skala) * 100) / 100;//Округляем до сотых
			t_ball_k_korrekc_skala=Math.round(parseFloat(t_ball_k_korrekc_skala) * 100) / 100;//Округляем до сотых
			document.getElementById("pan_skala_log").innerHTML=t_ball_l_log_skala;
			document.getElementById("pan_skala_f").innerHTML=t_ball_f_dost_skala;
			document.getElementById("pan_skala_k").innerHTML=t_ball_k_korrekc_skala;
			document.getElementById("pan_skala1").innerHTML=t_ball_e1_sverhkontr_skala;
			document.getElementById("pan_skala2").innerHTML=t_ball_e2_pissim_skala;
			document.getElementById("pan_skala3").innerHTML=t_ball_e3_emoc_lab_skala;
			document.getElementById("pan_skala4").innerHTML=t_ball_e4_impulsiv_skala;
			document.getElementById("pan_skala5").innerHTML=t_ball_e5_genst_skala;
			document.getElementById("pan_skala6").innerHTML=t_ball_e6_rigidnost_skala;
			document.getElementById("pan_skala7").innerHTML=t_ball_e7_trevoga_skala;
			document.getElementById("pan_skala8").innerHTML=t_ball_e8_individ_skala;
			document.getElementById("pan_skala9").innerHTML=t_ball_e9_optimist_skala;
			document.getElementById("pan_skala0").innerHTML=t_ball_e0_introversia_skala;

			document.getElementById("sir_pan_skala_log").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(997)">'+l_log_skala+'</span>';
			document.getElementById("sir_pan_skala_f").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(998)">'+f_dost_skala+'</span>';
			document.getElementById("sir_pan_skala_k").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(999)">'+k_korrekc_skala+'</span>';
			document.getElementById("sir_pan_skala1").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1000)">'+e1_sverhkontr_skala+'</span>';
			document.getElementById("sir_pan_skala2").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1001)">'+e2_pissim_skala+'</span>';
			document.getElementById("sir_pan_skala3").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1002)">'+e3_emoc_lab_skala+'</span>';
			document.getElementById("sir_pan_skala4").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1003)">'+e4_impulsiv_skala+'</span>';
			document.getElementById("sir_pan_skala5").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1004)">'+e5_genst_skala+'</span>';
			document.getElementById("sir_pan_skala6").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1005)">'+e6_rigidnost_skala+'</span>';
			document.getElementById("sir_pan_skala7").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1006)">'+e7_trevoga_skala+'</span>';
			document.getElementById("sir_pan_skala8").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1007)">'+e8_individ_skala+'</span>';
			document.getElementById("sir_pan_skala9").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1008)">'+e9_optimist_skala+'</span>';
			document.getElementById("sir_pan_skala0").innerHTML='<span style="cursor:pointer;color:blue" onclick="full_screen_smil_dop(1009)">'+e0_introversia_skala+'</span>';
			document.getElementById("sir_pan_skalaenez").innerHTML=enez_skala;
			//alert(e0_introversia_skala);
		    //alert(t_ball_f_dost_skala);

			 //Перестраиваем график


			 d3.push([0,t_ball_l_log_skala]);
			 d3.push([1,t_ball_f_dost_skala]);
			 d3.push([2,t_ball_k_korrekc_skala]);
			 d1.push([3,t_ball_e1_sverhkontr_skala]);
			 d1.push([4,t_ball_e2_pissim_skala]);
			 d1.push([5,t_ball_e3_emoc_lab_skala]);
			 d1.push([6,t_ball_e4_impulsiv_skala]);
			 d1.push([7,t_ball_e5_genst_skala]);
			 d1.push([8,t_ball_e6_rigidnost_skala]);
			 d1.push([9,t_ball_e7_trevoga_skala]);
			 d1.push([10,t_ball_e8_individ_skala]);
			 d1.push([11,t_ball_e9_optimist_skala]);
			 d1.push([12,t_ball_e0_introversia_skala]);
		//var d3 = [];
		//for (var i = -7; i < 7; i += 0.5)
		//{
			//d1.push([i, x * Math.sin(i)]);
			//d3.push([y + i, Math.cos(i)]);
		//}
		 //d1.push([3,2]);
                 //d1.push([3,50]);
		//alert(f);
                $.plot($("#placeholder"), [
			{
				data: d1,
				lines: { show: true, fill: false }, //, fill: true
				points: { show: true }
			},
			{
				data: d3,
				lines: { show: true, fill: false }, //, fill: true
                                points: { show: true }
			}
		],
		  {
		    yaxis: {
				ticks: 20,
				min: 0,
				max: 120,
				tickDecimals: 0, tickSize: 10
			},
			xaxis: {
				ticks: [
					[ 0, "L" ],
					[ 1, "F" ], [ 2, "K" ], [ 3, "1" ], [ 4, "2" ], [ 5, "3" ], [ 6, "4" ], [ 7, "5" ], [ 8, "6" ], [ 9, "7" ], [ 10, "8" ], [ 11, "9" ], [ 12, "0" ]
				],
			 min: 0,
			 max: 12
			}
		   }

		 );


		return false;
	}

	//$("#redraw").click(function (e) {
    //    e.preventDefault();
    //    re_plot();
    //});
});
//Конец построения графиков
