<template>
	<view class="page_box">
		<view class="head_box">
			<view class="cont-tier flex flex-wrap justify-between">
				<view class="tier-center">
					<text class="cuIcon-shop" style="float: left;"></text>
					<view class="text-xl cent-name text-bold">订单号：{{goodsList.length>0?goodsList[0][0]:"无"}} </view>
					<view class="cent-tip">单据日期：{{goodsList.length>0?goodsList[0][3].substring(0, 10):"无"}}</view>
				</view>
				<view class="tier-right">
					<image src="https://i.postimg.cc/Ss5H7mpk/xiangzi.png" mode="aspectFill"></image>
				</view>
			</view>
		</view>

		<view class="content_box" v-if="!isTake">
			<scroll-view :style="{ height: hHeight + 'px;background-color: #F3F3F3;' }" class="scroll-box bg-white"
				scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="content-box">
					<view class="goods-list x-f">
						<view class="goods-item" v-for="(goods, index) in goodsList" :key="index">
							<fz-circuit-meal :detail="goods" :pickType="pickType" :isTag="true"></fz-circuit-meal>
						</view>
					</view>
					<!-- 加载更多 -->
					<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
					<!-- load -->
					<app-load v-model="isLoading"></app-load>
				</view>
			</scroll-view>
		</view>
		<view class="content_box" v-else>
			<scroll-view :style="{ height: hHeight + 'px;background-color: #F3F3F3;' }" class="scroll-box bg-white"
				scroll-y enable-back-to-top scroll-with-animation @scrolltolower="loadMore">
				<view class="content-box">
					<view class="goods-list x-f">
						<view class="goods-item" v-for="(goods, index) in goodsListT" :key="index">
							<fz-circuit-pick :detail="goods" :pickType="pickType" :isTag="true">
								<block slot="btn">
									<view class="fot-text" v-if="isTake">
										<view class="fot-btn">
											<button :disabled="isClickSub" @tap.stop="takeOver(goods)"
												class="cu-btn round lines-blue buy-btn">
												收货
											</button>
										</view>
									</view>
								</block>
							</fz-circuit-pick>
						</view>
					</view>
					<!-- 加载更多 -->
					<view v-if="goodsListT.length" class="cu-load text-gray" :class="loadStatus"></view>
					<!-- load -->
					<app-load v-model="isLoading"></app-load>
				</view>
			</scroll-view>
		</view>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<view class="app-tabbar-wrap" v-if="goodsList.length>0">
			<view class="tabbar-box">
				<view class="tabbar-item">
					<button class="btn1" v-if="isWarehousing" :disabled="isClickWare"
						@tap.stop="onWarehousing">入库V8</button>
					<!-- <button class="btn2" v-if="isTake" :disabled="isClickSub" @tap.stop="onSubmit">确认收货</button> -->
				</view>
			</view>
		</view>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示
		<app-login-modal></app-login-modal> -->
	</view>
</template>

<script>
	import fzCircuitMeal from '@/components/fz-circuit-card/fz-circuit-box.vue';
	import fzCircuitPick from '@/components/fz-circuit-card/fz-circuit-pick.vue';
	import AppPay from '@/common/app-pay';
	import {
		mapMutations,
		mapActions,
		mapState
	} from 'vuex';
	import Md5 from "js-md5"
	export default {
		components: {
			fzCircuitMeal,
			fzCircuitPick
		},
		data() {
			return {
				hHeight: '0',
				listParams: {
					keywords: '',
					page: 1
				},
				isClickWare: false,
				isClickSub: false,
				isTake: false,
				isWarehousing: false,
				pickType: 0,
				colorList: this.ColorList,
				isLoading: false, //loading和空白页。
				loadStatus: '', //loading,over
				lastPage: 1,
				fBillNo: '',
				scanCode: '',
				goodsList: [],
				goodsListT: []
			};
		},
		props: {
			tabId: ''
		},
		mounted() {
			this.getScrHeight();
			//this.init();
		},
		onShow() {
			const {
				detail,
				type
			} = this.$Route.query;
			if (detail instanceof Array) {
				if (type == 0) {
					this.getGoodsList(JSON.parse(detail)[0])
				} else if (type == 1) {
					this.getPickList(detail);
				}
			}else{
				let q = decodeURIComponent(detail)
				if (this.GetRequest(q).type == 1) {
					this.getPickList(this.GetRequest(q).code);
					this.scanCode = this.GetRequest(q).code
				}
			}
			this.pickType = type
		},
		onLoad(options) {
			/* let that = this;
			let q = decodeURIComponent(options.detail);
			console.log(options.detail)
			console.log(that.GetRequest(q).type)
			if (typeof that.GetRequest(q).type != "undefined") {
				if (that.GetRequest(q).type == 1) {
					that.getPickList(that.GetRequest(q).code);
					that.scanCode = that.GetRequest(q).code
				}
			} */
		}, 
		onUnload() {
			var pages = getCurrentPages(); // 获取当前挂载的路由数组
			var prePage = pages[pages.length - 2] //获取 上一个页面
			if (typeof prePage.$vm.getCouponList == "function") {
				prePage.$vm.getCouponList()
			} else {
				prePage.$vm.getGoodsList()
			}
		},
		computed: {
			...mapState({
				userInfo: state => state.user.userInfo
			})
		},
		created() {},
		methods: {
			GetRequest(urlStr) {
				if (typeof urlStr == 'undefined') {
					var url = decodeURI(location.search); //获取url中"?"符后的字符串
				} else {
					var url = '?' + urlStr.split('?')[1];
				}
				var theRequest = new Object();
				if (url.indexOf('?') != -1) {
					var str = url.substr(1);
					var strs = str.split('&');
					for (var i = 0; i < strs.length; i++) {
						theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
					}
				}
				return theRequest;
			},
			init() {
				this.getGoodsList();
			},
			// 加载更多
			loadMore() {
				if (this.listParams.page < this.lastPage) {
					this.listParams.page += 1;
					this.getGoodsList();
				}
			},
			getScrHeight() {
				let me = this;
				uni.getSystemInfo({
					success: function(res) {
						// res - 各种参数
						let info = uni.createSelectorQuery().select('.head_box');
						info.boundingClientRect(function(data) {
							//data - 各种参数
							me.hHeight = res.windowHeight - data.height;
						}).exec();
					}
				});
			},
			getCouponDetail(billNo = "") {
				let that = this;
				that.loadStatus = 'loading';

			},
			onWarehousing() {
				let that = this;
				if (!that.userInfo[7]) {
					return uni.showToast({
						title: '该账号无收货权限',
						icon: 'error',
					});
				}
				that.isLoading = true;
				that.isClickWare = true;
				var bDShopID = ""
				let customerParams = {
					data: {
						"FilterString": "FNumber='" + that.goodsList[0][1]  + "'",
						"FormId": "BD_Customer",
						"FieldKeys": "FV8ID,FBDID,FName,FNumber,FCUSTID",
					}
				}
				that.$api('executeBillQuery', customerParams, 1).then(customerRes => {
					if (customerRes.length > 0) {
						that.isLoading = false;
						that.isClickWare = false;
						if(customerRes[0][0] !='' || customerRes[0][1] !=''){
							bDShopID = (customerRes[0][0] == ''?customerRes[0][1]:customerRes[0][0])
							let params = {
								"bDShopID": bDShopID,
								"deliveryBillNo": that.goodsList[0][0],
								"detailList": [],
								"isCheck": true,
								"supplier": that.goodsList[0][9],
								/* "note": "",
								"invoiceInfo": "",
								"billDate": "",
								"contacts": "",
								"telephone": "", */
								"timestamp": new Date().getTime()//,
								
							}
							for(var data in that.goodsList){
								params.detailList.push({
									"Number": that.goodsList[data][5],
									"Name": that.goodsList[data][6],
									"ProductNo": that.goodsList[data][17],
									"Unit": that.goodsList[data][7],
									"Model": that.goodsList[data][16],
									"Qty": that.goodsList[data][12],
									"Price": that.goodsList[data][18],
									"Amount": that.goodsList[data][19],
								})
							}
							let signKey = ""
							for(let obj in params){
								if(params[obj] instanceof Array){
									signKey+= obj+"="+JSON.stringify(params[obj])+"&"
								}else{
									signKey+= obj+"="+params[obj]+"&"
								}
							}
							
							signKey+="key=2uaH1yv8UIgvbuRVr32UpPjSgfsPj6RM"
							params.sign = Md5(signKey).toUpperCase()
							console.log(signKey)
							console.log(params)
							that.$api('addStorage', params,2).then(res => {
								if (res.success) {
									that.$api('kdSave', {
										"formid": "SAL_OUTSTOCK",
										"data": {
											"NeedUpDataFields": ["FEntity"],
											"NeedReturnFields": ["FEntity"],
											"IsDeleteEntry": false,
											"Model": {
												"FID": that.goodsList[0][14],
												"FOutStatus": "已入库",
											},
										}
									}, 1).then(
										saveRes => {
											let saveReso = saveRes[0];
											if (saveRes != null && saveRes['Result'][
													'ResponseStatus'
												]['IsSuccess']) {
													uni.showToast({
														title: '入库成功',
														icon: 'success',
													});
													setTimeout(() => {
														that.isLoading = false;
														that.isClickWare = false;
														var pages = getCurrentPages(); // 获取当前挂载的路由数组
														var prePage = pages[pages.length - 2] //获取 上一个页面
														uni.navigateBack({
															success() {
																if (typeof prePage.$vm.getCouponList == "function") {
																	prePage.$vm.getCouponList()
																} else {
																	prePage.$vm.getGoodsList()
																}
															}
														})
													}, 1000);
												} else {
													that.isLoading = false;
													that.isClickSub = false;
													uni.showToast({
														icon: 'none',
														title: saveRes[
																'Result'
															]
															[
																'ResponseStatus'
															]
															[
																'Errors'
															]
															[
																0
															]
															[
																'Message'
															]
													})
												}
										})
								}else{
									uni.showToast({
										icon: 'none',
										title: res.MsgText
									})
								}
							});
						}else{
							uni.showToast({
								icon: 'none',
								title: "无门店信息，请联系管理员"
							})
						}
					} else {
						that.isLoading = false;
						that.isClickWare = false;
						if (customerRes.length == 0) {
							uni.showToast({
								icon: 'none',
								title: "无门店信息，请联系管理员"
							})
						} else {
							uni.showToast({
								icon: 'none',
								title: customerRes[0][0]['Result']['ResponseStatus'][
									'Errors'
								][0]['Message']
							})
						}
					
					}
				})
				
				
			},
			treeToArray(tree) {
				const result = [];
				const queue = [tree];
				while (queue.length > 0) {
					const node = queue.shift();
					if (node.children) {
						node.children.forEach(child => {
							queue.push(child);
						});
					} else {
						result.push(node);
					}
				}

				return result;
			},
			async takeOver(takeItem) {
				let that = this
				if (!that.userInfo[7]) {
					return uni.showToast({
						title: '该账号无收货权限',
						icon: 'error',
					});
				}
				that.isLoading = true;
				that.isClickSub = true;
				console.log(takeItem);
				let takeArray = that.treeToArray(takeItem);
				console.log(takeArray)
				//提交数据整理，多单循环提交
				var orderList = []
				for (var element in takeArray) {
					if (orderList.findIndex(x => x.FID === takeArray[element]['FSrcID']) == -1) {
						//提交单据次数
						orderList.push({
							"FID": takeArray[element]['FSrcID'],
							"FEntity": [{
								"FEntryID": takeArray[element]['FSrcEntryID'],
								"FActRecQty": takeArray[element]['FQty']
							}]
						})
					} else {
						for (var fEntity in orderList) {
							//单据明细组装
							if (takeArray[element]['FSrcID'] == orderList[fEntity]['FID']) {
								if (orderList[fEntity]['FEntity'].findIndex(x => x.FEntryID === takeArray[element]['FSrcEntryID']) == -1) {
									orderList[fEntity]['FEntity'].push({
										"FEntryID": takeArray[element]['FSrcEntryID'],
										"FActRecQty": takeArray[element]['FQty']
									})
								} else {
									//相同项进行数量合计
									var findx = orderList[fEntity]['FEntity'].findIndex(x => x.FEntryID === takeArray[element]['FSrcEntryID']);
									orderList[fEntity]['FEntity'][findx]['FActRecQty'] = that.addCount(parseFloat(
										orderList[fEntity]['FEntity'][findx]['FActRecQty']), parseFloat(takeArray[
										element]['FQty']))
								}

							}
						}
					}
				}
				//获取数量 计算分录是否完成收货
				for (var orderFid in orderList) {
					var entityData = orderList[orderFid]['FEntity']
					for (var orderEntity in entityData) {
						let params = {
							data: {
								"FilterString": "FID =" + orderList[orderFid]['FID'] + " and FEntryId=" + entityData[orderEntity]['FEntryID'] +" and FEntryOutStatus = '待收货'",
								"FormId": "SAL_OUTSTOCK",
								"OrderString": "FBillNo ASC",
								"FieldKeys": "FActRecQty,FEntryActRecQty,FRealQty,FEntity_FEntryId,FEntryOutStatus",
							}
						}
						await that.$api('executeBillQuery', params, 1).then(res => {
							let reso = res[0];
							if (res.length > 0) {
								let FActRecQty = res[0][0],
									FEntryActRecQty = res[0][1],
									FRealQty = res[0][2];
								
								if(Number(FRealQty) - (Number(FActRecQty) + Number(entityData[orderEntity]['FActRecQty'])) <=0){
									entityData[orderEntity].FEntryOutStatus = '已收货'
								}else{
									entityData[orderEntity].FEntryOutStatus = '待收货'
								}
								entityData[orderEntity].FEntryActRecQty = Number(FRealQty) - (Number(FActRecQty) + Number(entityData[orderEntity]['FActRecQty']))
								entityData[orderEntity].FActRecQty = Number(FActRecQty) + Number(entityData[orderEntity]['FActRecQty'])
								console.log(Number(FRealQty) - (Number(FActRecQty) + Number(entityData[orderEntity]['FActRecQty'])))
							} else {
								if (res.length == 0) {
									uni.showToast({
										icon: 'none',
										title: "查不到源单数据或该项已完成收货"
									})
								} else {
									uni.showToast({
										icon: 'none',
										title: reso[0]['Result']['ResponseStatus']['Errors'][0]['Message']
									})
								}

							}
						});
					}
				}
				console.log(orderList)
				//批量反写实收数量和分录状态
				for (var saveList in orderList) {
					await that.$api('kdSave', {
						"formid": "SAL_OUTSTOCK",
						"data": {
							"NeedUpDataFields": ["FEntity"],
							"NeedReturnFields": ["FEntity"],
							"IsDeleteEntry": false,
							"Model": orderList[saveList],
						}
					}, 1).then(
						saveRes => {
							let saveReso = saveRes[0];
							if (saveRes != null && saveRes['Result'][
									'ResponseStatus'
								]['IsSuccess']) {
								//查询对应单据 是否完成收货 是：修改单据，否：跳过
								 that.$api('executeBillQuery', {
									data: {
										"FilterString": "FID =" + orderList[orderFid]['FID'] + " and FEntryOutStatus = '待收货' and FEntryOutStatus !=''",
										"FormId": "SAL_OUTSTOCK",
										"OrderString": "FBillNo ASC",
										"FieldKeys": "FEntryOutStatus",
									}
								}, 1).then(statusRes => {
									if (statusRes.length == 0) {
										//修改状态
										that.$api('kdSave', {
											"formid": "SAL_OUTSTOCK",
											"data": {
												"NeedUpDataFields": ["FEntity"],
												"NeedReturnFields": ["FEntity"],
												"IsDeleteEntry": false,
												"Model": {
													"FID": takeArray[element]['FSrcID'],
													"FOutStatus": "已收货",
												},
											}
										}, 1).then(
											saveTRes => {
												let saveTReso = saveTRes[0];
												if (saveTRes != null && saveTRes['Result'][
														'ResponseStatus'
													]['IsSuccess']) {
													that.isLoading = false;
													that.isClickSub = false;
													uni.showToast({
														title: '收货成功',
														icon: 'success',
													});
													if (that.pickType == 0) {
														that.getGoodsList(that.goodsList[0][0])
													} else if (that.pickType == 1) {
														that.getPickList(that.scanCode);
													}
												} else {
													that.isLoading = false;
													that.isClickSub = false;
													uni.showToast({
														icon: 'none',
														title: saveTRes[
																'Result'
															]
															[
																'ResponseStatus'
															]
															[
																'Errors'
															]
															[
																0
															]
															[
																'Message'
															]
													})
												}
											});
									}else{
										that.isLoading = false;
										that.isClickSub = false;
										uni.showToast({
											title: '收货成功',
											icon: 'success',
										});
										if (that.pickType == 0) {
											that.getGoodsList(that.goodsList[0][0])
										} else if (that.pickType == 1) {
											that.getPickList(that.scanCode);
										}
									}
								});
								if (Number(saveList) + 1 == orderList.length){
									let takeParams = {}
									takeParams.FID = takeArray[0]['FID']
									takeParams.FEntity = []
									for(let takeBox in takeArray){
										takeParams.FEntity.push({
											FEntryID: takeArray[takeBox]['FEntity_FEntryID'],
											FBoxQty: takeArray[takeBox]['FQty'],
										})
									}
									//修改装箱单
									that.$api('kdSave', {
											"formid": "QDEP_Cust_PackInfo",
											"data": {
												"NeedUpDataFields": [
													"FEntity"
												],
												"NeedReturnFields": [
													"FEntity"
												],
												"IsDeleteEntry": false,
												"Model": takeParams,
											}
										}, 1).then(takeRes => {
											let takeReso = takeRes[0];
											if (takeRes != null &&takeRes['Result']['ResponseStatus']['IsSuccess']) {
												//查询对应单据 是否完成收货 是：修改单据，否：跳过
												 that.$api('executeBillQuery', {
													data: {
														"FilterString": "FID =" + takeArray[0]['FID'] + " and FIsRec = 0 and FBoxQty =0",
														"FormId": "QDEP_Cust_PackInfo",
														"OrderString": "FBillNo ASC",
														"FieldKeys": "FBoxQty",
													}
												}, 1).then(takeStatusRes => {
													if (takeStatusRes.length == 0) {
														//修改装箱单
															that.$api('kdSave', {
																	"formid": "QDEP_Cust_PackInfo",
																	"data": {
																		"NeedUpDataFields": [
																			"FEntity"
																		],
																		"NeedReturnFields": [
																			"FEntity"
																		],
																		"IsDeleteEntry": false,
																		"Model": {
																			"FID": takeArray[0]['FID'],
																			"FIsRec": true,
																		},
																	}
																}, 1).then(takeTRes => {
																	let takeTReso = takeTRes[0];
																	if (takeTRes != null &&takeTRes['Result']['ResponseStatus']['IsSuccess']) {
																		
																	} else {
																		uni.showToast({
																				icon: 'none',
																				title: takeTRes['Result']['ResponseStatus']['Errors'][0]['Message']
																		})
																	}
														});
														
														
													}
												});
											} else {
												uni.showToast({
													icon: 'none',
													title: takeRes['Result']['ResponseStatus']['Errors'][0]['Message']
												})
											}
										});
								}
							} else {
								that.isLoading = false;
								that.isClickSub = false;
								uni.showToast({
									icon: 'none',
									title: saveRes[
											'Result'
										]
										[
											'ResponseStatus'
										]
										[
											'Errors'
										]
										[
											0
										]
										[
											'Message'
										]
								})
							}
						});
				}
				
			},
			onSubmit() {
				let that = this
				if (!that.userInfo[7]) {
					return uni.showToast({
						title: '该账号无收货权限',
						icon: 'error',
					});
				}
				that.isLoading = true;
				that.isClickSub = true;
				if (that.pickType == 0) {
					var fEntity = []
					for (var element in that.goodsList) {
						fEntity.push({
							"FEntryID": that.goodsList[element][4],
							"FActRecQty": that.goodsList[element][12],
						})
					}
					//反审
					that.$api('unAudit', {
						"formid": "SAL_OUTSTOCK",
						"data": {
							"Ids": that.goodsList[0][14],
						},
					}, 1).then(unAuditRes => {
						let unAuditReso = unAuditRes[0];
						if (unAuditRes != null && unAuditRes['Result']['ResponseStatus'][
								'IsSuccess'
							]) {
							//保存
							that.$api('kdSave', {
								"formid": "SAL_OUTSTOCK",
								"data": {
									"NeedUpDataFields": ["FEntity"],
									"NeedReturnFields": ["FEntity"],
									"IsDeleteEntry": false,
									"Model": {
										"FID": that.goodsList[0][14],
										"FOutStatus": "已收货",
										"FEntity": fEntity
									},
								}
							}, 1).then(
								saveRes => {
									let saveReso = saveRes[0];
									if (saveRes != null && saveRes['Result'][
											'ResponseStatus'
										]['IsSuccess']) {
										//提交
										that.$api('kdSubmit', {
											"formid": "SAL_OUTSTOCK",
											"data": {
												"Ids": that.goodsList[0][14],
											},
										}, 1).then(submitRes => {
											let submitReso = submitRes[0];
											if (submitRes != null && submitRes['Result'][
													'ResponseStatus'
												]['IsSuccess']) {
												//审核
												that.$api('kdAudit', {
													"formid": "SAL_OUTSTOCK",
													"data": {
														"Ids": that.goodsList[0][14],
													},
												}, 1).then(
													auditRes => {
														let auditReso = auditRes[0];
														if (auditRes != null && auditRes['Result'][
																'ResponseStatus'
															]['IsSuccess']) {
															uni.showToast({
																title: '收货成功',
																icon: 'success',
															});
															that.isLoading = false;
															that.isClickSub = false;
															setTimeout(() => {
																var pages =
																	getCurrentPages(); // 获取当前挂载的路由数组
																var prePage = pages[pages
																	.length - 2
																] //获取 上一个页面
																uni.navigateBack({
																	success() {
																		if (typeof prePage
																			.$vm
																			.getCouponList ==
																			"function"
																		) {
																			prePage
																				.$vm
																				.getCouponList()
																		} else {
																			prePage
																				.$vm
																				.getGoodsList()
																		}
																	}
																})
															}, 1000);
														} else {
															that.isLoading = false;
															that.isClickSub = false;
															uni.showToast({
																icon: 'none',
																title: auditRes[
																		'Result'
																	]
																	[
																		'ResponseStatus'
																	]
																	[
																		'Errors'
																	]
																	[
																		0
																	]
																	[
																		'Message'
																	]
															})
														}
													});
											} else {
												that.isLoading = false;
												that.isClickSub = false;
												uni.showToast({
													icon: 'none',
													title: submitRes[
															'Result'
														][
															'ResponseStatus'
														][
															'Errors'
														]
														[0][
															'Message'
														]
												})
											}
										});

									} else {
										that.isLoading = false;
										that.isClickSub = false;
										uni.showToast({
											icon: 'none',
											title: saveRes[
													'Result'
												]
												[
													'ResponseStatus'
												]
												[
													'Errors'
												]
												[
													0
												]
												[
													'Message'
												]
										})
									}
								});
						} else {
							that.isLoading = false;
							that.isClickSub = false;
							uni.showToast({
								icon: 'none',
								title: unAuditRes['Result'][
									'ResponseStatus'
								]['Errors'][0]['Message']
							})
						}
					});
				} else {
					//提交数据整理，多单循环提交
					var orderList = []
					for (var element in that.goodsList) {
						if (orderList.findIndex(x => x.FID === that.goodsList[element][1]) == -1) {
							//提交单据次数
							orderList.push({
								"FID": that.goodsList[element][1],
								"FOutStatus": "已收货",
								"FEntity": [{
									"FEntryID": that.goodsList[element][2],
									"FActRecQty": that.goodsList[element][12]
								}]
							})
						} else {
							for (var fEntity in orderList) {
								//单据明细组装
								if (that.goodsList[element][1] == orderList[fEntity]['FID']) {
									if (orderList[fEntity]['FEntity'].findIndex(x => x.FEntryID === that.goodsList[element]
											[2]) == -1) {
										orderList[fEntity]['FEntity'].push({
											"FEntryID": that.goodsList[element][2],
											"FActRecQty": that.goodsList[element][12]
										})
									} else {
										//相同项进行数量合计
										var findx = orderList[fEntity]['FEntity'].findIndex(x => x.FEntryID === that
											.goodsList[element][2]);
										orderList[fEntity]['FEntity'][findx]['FActRecQty'] = that.addCount(parseFloat(
											orderList[fEntity]['FEntity'][findx]['FActRecQty']), parseFloat(that
											.goodsList[element][12]))
									}

								}
							}
						}
					}
					for (var saveList in orderList) {
						//反审
						that.$api('unAudit', {
							"formid": "SAL_OUTSTOCK",
							"data": {
								"Ids": orderList[saveList]['FID'],
							},
						}, 1).then(unAuditRes => {
							let unAuditReso = unAuditRes[0];
							if (unAuditRes != null && unAuditRes['Result']['ResponseStatus'][
									'IsSuccess'
								]) {
								//保存
								that.$api('kdSave', {
									"formid": "SAL_OUTSTOCK",
									"data": {
										"NeedUpDataFields": ["FEntity"],
										"NeedReturnFields": ["FEntity"],
										"IsDeleteEntry": false,
										"Model": orderList[saveList],
									}
								}, 1).then(
									saveRes => {
										let saveReso = saveRes[0];
										if (saveRes != null && saveRes['Result'][
												'ResponseStatus'
											]['IsSuccess']) {
											//提交
											that.$api('kdSubmit', {
												"formid": "SAL_OUTSTOCK",
												"data": {
													"Ids": orderList[saveList]['FID'],
												},
											}, 1).then(submitRes => {
												let submitReso = submitRes[0];
												if (submitRes != null && submitRes['Result'][
														'ResponseStatus'
													]['IsSuccess']) {
													//审核
													that.$api('kdAudit', {
														"formid": "SAL_OUTSTOCK",
														"data": {
															"Ids": orderList[saveList]['FID'],
														},
													}, 1).then(
														auditRes => {
															let auditReso = auditRes[0];
															if (auditRes != null && auditRes[
																	'Result'][
																	'ResponseStatus'
																]['IsSuccess']) {
																//修改装箱单
																that.$api('kdSave', {
																	"formid": "QDEP_Cust_PackInfo",
																	"data": {
																		"NeedUpDataFields": [
																			"FEntity"
																		],
																		"NeedReturnFields": [
																			"FEntity"
																		],
																		"IsDeleteEntry": false,
																		"Model": {
																			"FID": that
																				.goodsList[
																					0][13],
																			"FIsRec": true,
																		},
																	}
																}, 1).then(
																	takeRes => {
																		let takeReso = takeRes[
																			0];
																		if (takeRes != null &&
																			takeRes['Result'][
																				'ResponseStatus'
																			]['IsSuccess']) {
																			if (saveList + 1 ==
																				orderList
																				.length) {
																				that.isLoading =
																					false;
																				that.isClickSub =
																					false;
																				uni.showToast({
																					title: '收货成功',
																					icon: 'success',
																				});
																				setTimeout(
																					() => {
																						var pages =
																							getCurrentPages(); // 获取当前挂载的路由数组
																						var prePage =
																							pages[
																								pages
																								.length -
																								2
																							] //获取 上一个页面
																						uni.navigateBack({
																							success() {
																								if (typeof prePage
																									.$vm
																									.getCouponList ==
																									"function"
																								) {
																									prePage
																										.$vm
																										.getCouponList()
																								} else {
																									prePage
																										.$vm
																										.getGoodsList()
																								}
																							}
																						})
																					}, 1000
																				);
																			}
																		} else {
																			that.isLoading =
																				false;
																			that.isClickSub =
																				false;
																			uni.showToast({
																				icon: 'none',
																				title: takeRes[
																						'Result'
																					]
																					[
																						'ResponseStatus'
																					]
																					[
																						'Errors'
																					]
																					[0]
																					[
																						'Message'
																					]
																			})
																		}
																	});


															} else {
																that.isLoading = false;
																that.isClickSub = false;
																uni.showToast({
																	icon: 'none',
																	title: auditRes[
																			'Result'
																		]
																		[
																			'ResponseStatus'
																		]
																		[
																			'Errors'
																		]
																		[
																			0
																		]
																		[
																			'Message'
																		]
																})
															}
														});
												} else {
													that.isLoading = false;
													that.isClickSub = false;
													uni.showToast({
														icon: 'none',
														title: submitRes[
																'Result'
															][
																'ResponseStatus'
															][
																'Errors'
															]
															[0][
																'Message'
															]
													})
												}
											});

										} else {
											that.isLoading = false;
											that.isClickSub = false;
											uni.showToast({
												icon: 'none',
												title: saveRes[
														'Result'
													]
													[
														'ResponseStatus'
													]
													[
														'Errors'
													]
													[
														0
													]
													[
														'Message'
													]
											})
										}
									});
							} else {
								that.isLoading = false;
								that.isClickSub = false;
								uni.showToast({
									icon: 'none',
									title: unAuditRes['Result'][
										'ResponseStatus'
									]['Errors'][0]['Message']
								})
							}
						});
					}


				}
			},
			addCount(num1, num2) {
				let n1, n2, m
				try {
					n1 = num1.toString().split(".")[1].length
				} catch (e) {
					n1 = 0
				}
				try {
					n2 = num2.toString().split(".")[1].length
				} catch (e) {
					n2 = 0
				}
				m = Math.pow(10, Math.max(n1, n2))
				return (num1 * m + num2 * m) / m
			},
			arrayToTree(list, rootValue) {
				const deepList = JSON.parse(JSON.stringify(list)) // 深拷贝
				  const arr = []
				  deepList.forEach(item => {
				    if (item.parentId === rootValue) {
				      const children = this.arrayToTree(deepList, item.barCode)
				      children.length ? (item.children = children) : false
				      // item.children = children // 如果希望每个item都有children属性, 可以直接赋值
				      arr.push(item)
				    }
				  })
				  return arr
			},
			// 商品列表
			getGoodsList(billNo) {
				let that = this;
				that.loadStatus = 'loading';
				let params = {
					data: {
						"FilterString": "FDocumentStatus ='C' and FBillNo='" + billNo + "'",
						"FormId": "SAL_OUTSTOCK",
						"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
						"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel,FMaterialId.FBARCODE,FTaxPrice,FAllAmount",
					}
				}
				that.$api('executeBillQuery', params, 1).then(res => {
					let reso = res[0];
					if (res.length > 0) {
						that.isLoading = false;
						that.goodsList = res;
						if (that.goodsList[0][15] == '已收货') {
							that.isWarehousing = true;
						}
						if (that.goodsList[0][15] == '待收货') {
							that.isTake = true;
						}
						if (that.goodsList[0][15] == '待收货') {
							let pickParams = {
								data: {
									"FilterString": "FOutBillNo='" + that.goodsList[0][0] + "' and FBoxQty=0 and FIsRec = 0",
									"FormId": "QDEP_Cust_PackInfo",
									"OrderString": "FBillNo ASC",
									"FieldKeys": "FBillNo,FSrcID,FSrcEntryID,FCreateDate,FEntity_FEntryId,FMaterialID.FNumber,FMaterialName,FOutBillNo,FBoxQty,FBoxBarcode,FPackQty,FPackBarCode,FQty,FID,FEntity_FEntryID,FIsRec,FMarerialSpec",
								}
							}
							that.$api('executeBillQuery', pickParams, 1).then(pickRes => {
								if (pickRes.length > 0) {
									console.log(pickRes);
									var bigPick = []
									for (var bigItem in pickRes) {
										bigPick.push({
											FBillNo: pickRes[bigItem][0],
											FSrcID: pickRes[bigItem][1],
											FSrcEntryID: pickRes[bigItem][2],
											FCreateDate: pickRes[bigItem][3],
											FEntity_FEntryId: pickRes[bigItem][4],
											FMaterialFNumber: pickRes[bigItem][5],
											FMaterialName: pickRes[bigItem][6],
											FOutBillNo: pickRes[bigItem][7],
											FBoxQty: pickRes[bigItem][8],
											FBoxBarcode: pickRes[bigItem][9],
											FPackQty: pickRes[bigItem][10],
											FPackBarCode: pickRes[bigItem][11],
											FQty: pickRes[bigItem][12],
											FID: pickRes[bigItem][13],
											FEntity_FEntryID: pickRes[bigItem][14],
											FIsRec: pickRes[bigItem][15],
											FMarerialSpec: pickRes[bigItem][16],
											parentId: pickRes[bigItem][9]
										})
									}
									var boxBarcodeArray = []
									var packBarCodeArray = []
									var nowArray = []
									for (var bigItem in bigPick) {
										if (boxBarcodeArray.indexOf(bigPick[bigItem].FPackBarCode) == -1) {
											boxBarcodeArray.push(bigPick[bigItem].FPackBarCode)
											bigPick.push({
												parentId: -1,
												barCode: bigPick[bigItem].FPackBarCode
											})
											packBarCodeArray.push(bigPick[bigItem].FBoxBarcode)
											bigPick.push({
												parentId: bigPick[bigItem].FPackBarCode,
												barCode: bigPick[bigItem].FBoxBarcode
											})
										} else {
											if (packBarCodeArray.indexOf(bigPick[bigItem].FBoxBarcode) == -
												1) {
												packBarCodeArray.push(bigPick[bigItem].FBoxBarcode)
												bigPick.push({
													parentId: bigPick[bigItem].FPackBarCode,
													barCode: bigPick[bigItem].FBoxBarcode
												})
											}
										}
									}
									console.log(bigPick)
									that.goodsListT = that.arrayToTree(bigPick, -1);
									that.$set(that, 'goodsListT', that.arrayToTree(bigPick, -1));
									console.log(11111)
									console.log(that.goodsListT)
									that.$forceUpdate();
									that.loadStatus = 'over';
								} else {
									if (pickRes.length == 0) {
										uni.showToast({
											icon: 'none',
											title: "无数据"
										})
										that.goodsListT = []
									} else {
										uni.showToast({
											icon: 'none',
											title: pickRes[0][0]['Result']['ResponseStatus'][
												'Errors'
											][0]['Message']
										})
									}

								}
							});
						} else {
							that.loadStatus = 'over';
						}
					} else {
						if (res.length == 0) {
							uni.showToast({
								icon: 'none',
								title: "无数据"
							})
						} else {
							uni.showToast({
								icon: 'none',
								title: reso[0]['Result']['ResponseStatus']['Errors'][0]['Message']
							})
						}

					}
				});
			}, // 商品列表
			getPickList(code) {
				console.log(code)
				let that = this;
				that.loadStatus = 'loading';
				let params = {
					data: {
						"FilterString": "(FBoxBarcode='" + code + "' or FPackBarCode='" + code + "')  and FBoxQty=0 and FIsRec = 0",
						"FormId": "QDEP_Cust_PackInfo",
						"OrderString": "FBillNo ASC",
						"FieldKeys": "FBillNo,FSrcID,FSrcEntryID,FCreateDate,FEntity_FEntryId,FMaterialID.FNumber,FMaterialName,FOutBillNo,FBoxQty,FBoxBarcode,FPackQty,FPackBarCode,FQty,FID,FEntity_FEntryID,FIsRec,FMarerialSpec",
					}
				}
				that.$api('executeBillQuery', params, 1).then(res => {
					let reso = res[0];
					if (res.length > 0) {
						that.isLoading = false;
						that.goodsList = res;
						if (that.goodsList[0][15]) {
							that.isTake = false;
						} else {
							that.isTake = true;
						}
						var bigPick = []
						for (var bigItem in res) {
							bigPick.push({
								FBillNo: res[bigItem][0],
								FSrcID: res[bigItem][1],
								FSrcEntryID: res[bigItem][2],
								FCreateDate: res[bigItem][3],
								FEntity_FEntryId: res[bigItem][4],
								FMaterialFNumber: res[bigItem][5],
								FMaterialName: res[bigItem][6],
								FOutBillNo: res[bigItem][7],
								FBoxQty: res[bigItem][8],
								FBoxBarcode: res[bigItem][9],
								FPackQty: res[bigItem][10],
								FPackBarCode: res[bigItem][11],
								FQty: res[bigItem][12],
								FID: res[bigItem][13],
								FEntity_FEntryID: res[bigItem][14],
								FIsRec: res[bigItem][15],
								FMarerialSpec: res[bigItem][16],
								parentId: res[bigItem][9]
							})
						}
						var boxBarcodeArray = []
						var packBarCodeArray = []
						var nowArray = []
						for (var bigItem in bigPick) {
							if (boxBarcodeArray.indexOf(bigPick[bigItem].FPackBarCode) == -1) {
								boxBarcodeArray.push(bigPick[bigItem].FPackBarCode)
								bigPick.push({
									parentId: -1,
									barCode: bigPick[bigItem].FPackBarCode
								})
								packBarCodeArray.push(bigPick[bigItem].FBoxBarcode)
								bigPick.push({
									parentId: bigPick[bigItem].FPackBarCode,
									barCode: bigPick[bigItem].FBoxBarcode
								})
							} else {
								if (packBarCodeArray.indexOf(bigPick[bigItem].FBoxBarcode) == -1) {
									packBarCodeArray.push(bigPick[bigItem].FBoxBarcode)
									bigPick.push({
										parentId: bigPick[bigItem].FPackBarCode,
										barCode: bigPick[bigItem].FBoxBarcode
									})
								}
							}
						}
						that.goodsListT = that.arrayToTree(bigPick, -1);
						that.$set(that, 'goodsListT', that.arrayToTree(bigPick, -1));
						console.log(11111)
						console.log(that.goodsListT)
						that.$forceUpdate();
						that.loadStatus = 'over';
					} else {
						if (res.length == 0) {
							uni.showToast({
								icon: 'none',
								title: "无数据"
							})
							that.goodsListT = []
						} else {
							uni.showToast({
								icon: 'none',
								title: reso[0]['Result']['ResponseStatus']['Errors'][0]['Message']
							})
						}

					}
				});
			},

			// 路由跳转
			jump(path, parmas) {
				this.$Router.push({
					path: path,
					query: parmas
				});
			}
		}
	};
</script>

<style lang="scss">
	.page_box {
		height: auto;
		background-color: #F3F3F3;
		width: 100%;
	}

	.fot-text {
		width: 100%;
		height: 70rpx;
		line-height: 70rpx;
		display: flex;

		.text-grey {
			width: 50%;
		}

		.fot-btn {
			width: 100%;
			display: flex;
			justify-content: flex-end;
			height: 60rpx;

			.buy-btn {
				width: 140rpx;
				height: 60rpx;
				border-radius: 30rpx;
				font-size: 26rpx;
				font-family: PingFang SC;
				font-weight: 400;
				padding: 0;
			}

			.btn-end {
				background: linear-gradient(90deg, #c6e2ff, #b9d3ee);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: white;
			}

			.btn-nostart {
				background: linear-gradient(90deg, #ffec8b, #eedc82);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: #ff8247;
			}

			.btn-ing {
				background: linear-gradient(90deg, #fff0f5, #ffe4e1);
				box-shadow: 1px 1px 1px 1px rgba(229, 138, 0, 0.22);
				color: rgba(238, 99, 99, 1);
			}
		}
	}

	.head_box {
		width: auto;
		height: auto;
		background-color: #3D7DF2;
		overflow: hidden;
		position: relative;
		margin: 15rpx;
		padding: 30rpx;
		border-radius: 15rpx;
		color: white;

		.cont-tier {
			.tier-left {}

			.tier-center {
				width: 500rpx;

				text {
					line-height: 40rpx;
				}

				.cent-tip {
					border-radius: 0 30rpx 30rpx 25rpx;
					padding: 3rpx;
				}

				.cent-name {
					font-size: 32rpx;
					line-height: rpx;
				}


			}

			.tier-right {
				image {
					width: 120rpx;
					height: 80rpx;
				}
			}

		}

		.tag-star {
			position: absolute;
			right: 0;
			top: 0;
			z-index: 2;
			width: 0;
			height: 0;
			border-top: 60upx solid #ffe4b5;
			border-left: 60upx solid transparent;

			text {
				top: -55upx;
				left: -32upx;
				position: absolute;
				z-index: 999;
				display: inline-block;
			}
		}
	}

	// 宫格
	.sh-grid-box {
		background: #fff;
		display: flex;
		flex-wrap: wrap;
		padding-bottom: 30rpx;

		.tool-item {
			width: (750rpx/3);

			.tool-img {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				// background: #ccc;
			}

			.item-title {
				font-size: 24rpx;
				font-family: PingFang SC;
				font-weight: 500;
				line-height: 24rpx;
				padding-top: 10rpx;
			}
		}
	}

	.card-swiper {
		height: 350upx !important;
	}

	.card-swiper uni-swiper-item {
		padding: 5px 0 15px !important;
	}

	.content-box {
		width: 750rpx;
		background-color: #F3F3F3;
	}

	.box-head {
		border-bottom: 1px solid #e8eacf;
	}

	.goods-list {
		flex-wrap: wrap;

		.goods-item {
			width: 100%;
		}
	}

	.cir_group {
		width: 100%;
		height: 100%;
		background-color: red;
		/* 对于不支持渐变的浏览器*/
		background-image: linear-gradient(#2b4055, #5c92c1, #2b4055);
		/* 标准语法(必须是最后一个) */
		display: flex;

		.cir_logo {
			display: inline-flex;
			width: 40%;
			padding: 20rpx;

			image {
				border-radius: 15rpx;
				width: 100%;
			}

			.tag {
				position: absolute;
				left: 10rpx;
				top: 40rpx;
				z-index: 2;
				line-height: 30rpx;
				background: linear-gradient(132deg, rgba(28, 28, 28, 1), rgba(54, 54, 54, 1), rgba(236, 190, 96, 1));
				border-radius: 0px 18rpx 18rpx 0px;
				padding: 0 10rpx;
				-webkit-transform: scale(0.8);
				font-family: PingFang SC;
				color: white;
			}
		}

		.cir_detail {
			width: 60%;
			padding: 20rpx;
			padding-left: 0;
			font-family: PingFang SC;
			display: inline-block;

			.de_name {
				width: 100%;
				font-size: 40rpx;
				line-height: 60rpx;
			}

			.de_pin {
				line-height: 40rpx;
				width: 100%;
			}

			.de_info {
				line-height: 40rpx;
				width: 100%;
			}
		}
	}

	.tower-swiper .tower-item {
		transform: scale(calc(0.5 + var(--index) / 10));
		margin-left: calc(var(--left) * 100upx - 150upx);
		z-index: var(--index);
	}

	.app-tabbar-wrap {
		height: calc(120rpx + env(safe-area-inset-bottom) / 2);
		padding-bottom: calc(env(safe-area-inset-bottom) / 2);
		position: relative;
		width: 100%;
		z-index: 70;

		.tabbar-box {
			position: fixed;
			display: flex;
			align-items: center;
			width: 100%;
			height: calc(120rpx + env(safe-area-inset-bottom) / 2);
			border-top: 1rpx solid #eeeeee;
			background-color: #fff;
			z-index: 998;
			bottom: 0;
			padding-bottom: calc(env(safe-area-inset-bottom) / 2);

			.tabbar-item {
				height: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				flex: 1;

				.btn1 {
					width: 250rpx;
					border-radius: 40rpx;
					color: white;
					background-color: #10C1B3;
					font-size: 32rpx;
				}

				.btn2 {
					width: 250rpx;
					border-radius: 40rpx;
					color: white;
					background-color: #3D7DF2;
					font-size: 32rpx;
				}

			}
		}
	}
</style>