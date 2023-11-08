<template>
	<view class="page_box">
		<view class="content_box">
			<scroll-view scroll-y="true" enable-back-to-top @scrolltolower="loadMore" class="scroll-box">
				<view class="goods-item" v-for="(item,index) in goodsList" :key="index">
					<wallet-list :title="item[0]" :subtitle="item[1]" :index="index">
						<block slot="sell">
							<view class="x-f">
								<view>是否管理员：{{ item[2]==true?"是":"否" }}</view>
							</view>
						</block>
						<block slot="btn">
							<view class="fot-text">
								<view class="fot-btn">
									<button @tap.stop="editing(item)" class="cu-btn round lines-blue buy-btn">
										编辑
									</button>
									<button @tap.stop="deleteEmp(item)" class="cu-btn round lines-red buy-btn">
										禁用
									</button>
								</view>
							</view>
						</block>
					</wallet-list>
				</view>
				<!-- 空白 -->
				<app-empty v-if="!goodsList.length && !isLoading" :emptyData="emptyData"></app-empty>
				<!-- 加载更多 -->
				<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
				<!-- loading -->
				<app-load v-model="isLoading"></app-load>
			</scroll-view>
		</view>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<view class="app-tabbar-wrap" v-if="goodsList.length>0">
			<view class="tabbar-box">
				<view class="tabbar-item">
					<button class="btn1" @tap.stop="onAdd">新增</button>
				</view>
			</view>
		</view>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 -->
		<!-- <app-login-modal></app-login-modal> -->
	</view>
</template>
<script>
	import walletList from './components/fz-wallets.vue';
	import appEmpty from '@/components/app-empty/app-empty.vue';
	import {
		mapMutations,
		mapActions,
		mapState,
		mapGetters
	} from 'vuex';
	export default {
		components: {
			walletList,
			appEmpty
		},
		data() {
			return {
				emptyData: {
					img: '/static/imgs/empty/empty_goods.png',
					tip: '暂无员工数据~'
				},
				isLoading: false,
				loadStatus: '', //loading,over
				lastPage: 1,
				currentPage: 1,
				status: 0,
				tabCurrent: 'ing',
				goodsList: [],
				loading: false,
			};
		},
		computed: {
			...mapState({
				userInfo: state => state.user.userInfo,
			})
		},
		onShow() {
			const {
				query
			} = this.$Route;
			console.log();
			this.getGoodsList();
		},
		onUnload() {
			var pages = getCurrentPages(); // 获取当前挂载的路由数组
			var prePage = pages[pages.length - 2] //获取 上一个页面
			prePage.$vm.getGoodsList()
		},
		methods: {
			deleteEmp(val) {
				console.log(val)
				let that = this
				uni.showModal({
					title: '提示',
					content: '是否禁用该用户',
					success: function(res) {
						if (res.confirm) {
							//显示加载框
							uni.showLoading({
								title: 'Loading'
							});
							//反审
							that.$api('unAudit', {
								"formid": "QDEP_Cust_ShopEmp",
								"data": {
									"Ids": val[3],
								},
							}, 1).then(unAuditRes => {
								let unAuditReso = unAuditRes[0];
								if (unAuditRes != null && unAuditRes['Result']['ResponseStatus'][
										'IsSuccess'
									]) {
									//禁用
									that.$api('kdSave', {
										"formid": "QDEP_Cust_ShopEmp",
										"data": {
											"NeedUpDataFields": ["FEntity"],
											"NeedReturnFields": ["FEntity"],
											"IsDeleteEntry": false,
											"Model": {
												"FID": val[3],
												"FEntity": [{
													"FEntryID": val[5],
													"FIsDel": true
												}]
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
													"formid": "QDEP_Cust_ShopEmp",
													"data": {
														"Ids": val[3],
													},
												}, 1).then(submitRes => {
													let submitReso = submitRes[0];
													if (submitRes != null && submitRes[
															'Result']['ResponseStatus'][
															'IsSuccess'
														]) {
														//审核
														that.$api('kdAudit', {
															"formid": "QDEP_Cust_ShopEmp",
															"data": {
																"Ids": val[3],
															},
														}, 1).then(
															saveRes => {
																let saveReso = saveRes[
																	0];
																if (saveRes != null &&
																	saveRes['Result'][
																		'ResponseStatus'
																	]['IsSuccess']) {
																	that
																.getGoodsList();
																uni.hideLoading();
																} else {
																	uni.hideLoading();
																	uni.showToast({
																		icon: 'none',
																		title: submitRes[
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
														uni.hideLoading();
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
												uni.hideLoading();
												uni.showToast({
													icon: 'none',
													title: submitRes[
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
									uni.hideLoading();
									uni.showToast({
										icon: 'none',
										title: unAuditRes['Result'][
											'ResponseStatus'
										]['Errors'][0]['Message']
									})
								}
							});
						} else if (res.cancel) {

						}
					}
				});
			},
			editing(val) {
				let obj = {};
				obj.detail = JSON.stringify(val);
				obj.type = 1
				this.jump('/pages/user/wallet/add-user', obj);
			},
			onAdd() {
				let obj = {};
				obj.type = 0
				obj.detail = JSON.stringify(this.goodsList[0]);
				this.jump('/pages/user/wallet/add-user', obj);
			},
			jump(path, parmas) {
				this.$Router.push({
					path: path,
					query: parmas
				});
			},
			// 加载更多
			loadMore() {
				if (this.currentPage < this.lastPage) {
					this.currentPage += 1;
					this.getGoodsList();
				}
			},
			// 列表
			getGoodsList() {
				let that = this;
				that.loadStatus = 'loading';
				let params = {
					data: {
						"FilterString": "FDocumentStatus ='C' and FID=" + this.userInfo[3] + " and FEmpNo != '" + this
							.userInfo[0] + "' and FIsDel = 0",
						"FormId": "QDEP_Cust_ShopEmp",
						"OrderString": "FCreateTime ASC",
						"FieldKeys": "FEmpNo,FEmpName,FIsManage,FID,FOpenID,FEntity_FEntryID,FWXPwd",
					}
				}
				that.$api('executeBillQuery', params, 1).then(res => {
					let reso = res[0];
					if (res.length > 0) {
						that.isLoading = false;
						that.goodsList = res;
						console.log(that.goodsList)
						that.loadStatus = 'over';
					} else {
						uni.showToast({
							icon: 'none',
							title: reso['Result'][
								'ResponseStatus'
							]['Errors'][0]['Message']
						})
					}
				});
			},
		}
	};
</script>

<style scoped lang="scss">
	.head_box {
		background-color: #2b4055;
	}

	.tab-box {
		overflow: hidden;
		width: 100%;
		height: 84rpx;
		border: 1px solid #f8f8ff;
		border-radius: 40rpx 40rpx 0 0;

		.tab-item {
			flex: 1;
			line-height: 84rpx;
			text-align: center;
			background: #ffffff;
			font-size: 28rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: #999999;
			position: relative;
			border-right: 1rpx solid #fff;

			.tab-triangle {
				position: absolute;
				z-index: 2;
				bottom: 0;
				left: 42%;
				border-radius: 5rpx;
				width: 45rpx;
				height: 10rpx;
				background: #2b4055;
			}
		}

		.tab-active {
			color: #333333;
		}
	}

	.goods-item {
		position: relative;
		margin-bottom: 2rpx;

		.cu-progress {
			width: 225rpx;
			height: 16rpx;

			.progress--color {
				background: #e6b873;
			}
		}

		.progress-text {
			color: #999999;
			font-size: 20rpx;
			margin-left: 25rpx;
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