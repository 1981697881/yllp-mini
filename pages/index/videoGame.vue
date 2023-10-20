<template>
	<view class="page_box">
		<view class="head_box">
			<view class="cont-tier flex flex-wrap justify-between">
				<view class="tier-center">
					<text class="cuIcon-shop" style="float: left;"></text>
					<view class="text-xl cent-name text-bold">订单号：{{goodsList.length>0?goodsList[0][0]:"无"}}</view>
					<view class="cent-tip">单据日期：{{goodsList.length>0?goodsList[0][3].substring(0, 10):"无"}}</view>
				</view>
				<view class="tier-right">
					<image src="https://i.postimg.cc/Ss5H7mpk/xiangzi.png" mode="aspectFill"></image>
				</view>
			</view>
		</view>
		<view class="content_box">
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
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<view class="app-tabbar-wrap" v-if="goodsList.length>0">
			<view class="tabbar-box">
				<view class="tabbar-item">
					<button class="btn1" v-if="isWarehousing" @tap.stop="onWarehousing">入库V8</button>
					<button class="btn2" v-if="isTake" @tap.stop="onSubmit">确认收货</button>
				</view> 
			</view>
		</view>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示
		<app-login-modal></app-login-modal> -->
		<!-- 门店选择 -->
		<app-address-model @init="init"></app-address-model>
	</view>
</template>

<script>
	import moreGoodList from '@/csJson/moreGoodList.json';
	import fzCircuitMeal from '@/components/fz-circuit-card/fz-circuit-box.vue';
	import AppPay from '@/common/app-pay';
	import {
		mapMutations,
		mapActions,
		mapState
	} from 'vuex';
	export default {
		components: {
			fzCircuitMeal
		},
		data() {
			return {
				hHeight: '0',
				listParams: {
					keywords: '',
					page: 1
				},
				isTake: false,
				isWarehousing: false,
				pickType: 0,
				colorList: this.ColorList,
				isLoading: false, //loading和空白页。
				loadStatus: '', //loading,over
				lastPage: 1,
				fBillNo: '',
				goodsList: []
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
			console.log(detail)
			if (type == 0) {
				this.getGoodsList(JSON.parse(detail)[0])
			} else if(type == 1){
				this.getPickList(detail);
			}
			this.pickType = type

		},
		onLoad(options) {
			let that = this;
			console.log(options)
			let q = decodeURIComponent(options.q);
			console.log(q)
			console.log(that.GetRequest(q).type)
			if (typeof that.GetRequest(q).type != "undefined") {
				if (that.GetRequest(q).type == 1) {
					this.getPickList(that.GetRequest(q).code);
				}
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
			onWarehousing(){
				uni.showToast({
					title: '入库成功',
					icon: 'success',
				});
				setTimeout(() => {
					var pages = getCurrentPages(); // 获取当前挂载的路由数组
					var prePage = pages[pages.length - 2] //获取 上一个页面
					uni.navigateBack({
						success() {
								prePage.$vm.getCouponList() // 当返回成功的时候调用上一级页面的回调
					     }
					})
				}, 1000);
			},
			onSubmit() {
				let that = this
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
															setTimeout(() => {
																var pages = getCurrentPages(); // 获取当前挂载的路由数组
																var prePage = pages[pages.length - 2] //获取 上一个页面
																uni.navigateBack({
																	success() {
																			prePage.$vm.getCouponList() // 当返回成功的时候调用上一级页面的回调
																     }
																})
															}, 1000);
														} else {
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
					for(var element in that.goodsList){
						if(orderList.findIndex(x => x.FID === that.goodsList[element][1])==-1){
							//提交单据次数
							orderList.push({
								"FID": that.goodsList[element][1],
								"FOutStatus": "已收货",
								"FEntity": [{
									"FEntryID": that.goodsList[element][2],
									"FActRecQty": that.goodsList[element][12]
								}]
							})
						}else{
							for(var fEntity in orderList){
								//单据明细组装
								if(that.goodsList[element][1] == orderList[fEntity]['FID']){
									if(orderList[fEntity]['FEntity'].findIndex(x => x.FEntryID === that.goodsList[element][2])==-1){
										orderList[fEntity]['FEntity'].push({
											"FEntryID": that.goodsList[element][2],
											"FActRecQty": that.goodsList[element][12]
										})
									}else{
										//相同项进行数量合计
										var findx = orderList[fEntity]['FEntity'].findIndex(x => x.FEntryID === that.goodsList[element][2]);
										orderList[fEntity]['FEntity'][findx]['FActRecQty'] = that.addCount(parseFloat(orderList[fEntity]['FEntity'][findx]['FActRecQty']), parseFloat(that.goodsList[element][12]))
									}
									
								}
							}
						}
					}
					 for(var saveList in orderList){
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
															if (auditRes != null && auditRes['Result'][
																	'ResponseStatus'
																]['IsSuccess']) {
																	//修改装箱单
																	that.$api('kdSave', {
																		"formid": "QDEP_Cust_PackInfo",
																		"data": {
																			"NeedUpDataFields": ["FEntity"],
																			"NeedReturnFields": ["FEntity"],
																			"IsDeleteEntry": false,
																			"Model": {
																				"FID": that.goodsList[0][13],
																				"FIsRec": true,
																			},
																		}
																	}, 1).then(
																		takeRes => {
																			let takeReso = takeRes[0];
																			if (takeRes != null && takeRes['Result']['ResponseStatus']['IsSuccess']) {
																				if(saveList+1 == orderList.length){
																					uni.showToast({
																						title: '收货成功',
																						icon: 'success',
																					});
																					setTimeout(() => {
																						var pages = getCurrentPages(); // 获取当前挂载的路由数组
																						var prePage = pages[pages.length - 2] //获取 上一个页面
																						uni.navigateBack({
																							success() {
																									prePage.$vm.getCouponList() // 当返回成功的时候调用上一级页面的回调
																							 }
																						})
																					}, 1000);
																				}
																			} else {
																				uni.showToast({
																					icon: 'none',
																					title: takeRes['Result']['ResponseStatus']['Errors'][0]['Message']
																				})
																			}
																		});
																
																
															} else {
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
			// 商品列表
			getGoodsList(billNo) {
				let that = this;
				that.loadStatus = 'loading';
				let params = {
					data: {
						"FilterString": "FDocumentStatus ='C' and FBillNo='" + billNo + "'",
						"FormId": "SAL_OUTSTOCK",
						"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
						"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel",
						"Limit": "10"
					}
				}
				that.$api('executeBillQuery', params, 1).then(res => {
					let reso = res[0];
					if (res.length > 0) {
						that.isLoading = false;
						that.goodsList = res;
						if(that.goodsList[0][15] =='已收货'){
							that.isWarehousing = true;
						}
						if(that.goodsList[0][15] =='待收货'){
							that.isTake = true;
						}
						that.loadStatus = 'over';
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
				let that = this;
				that.loadStatus = 'loading';
				let params = {
					data: {
						"FilterString": "(FBoxBarcode='" + code + "' or FPackBarCode='" + code + "')",
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
						if(that.goodsList[0][15]){
							that.isTake = false;
						}else{
							that.isTake = true;
						}
						that.loadStatus = 'over';
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