<template>
	<view class="container">
		<view class="user-list x-bc">
			<text class="list-name">名称: {{userInfo[1]}}</text>
		</view>
		<view class="user-list x-bc">
			<text class="list-name">工号：{{userInfo[0]}}</text>
		</view>
		<view class="user-list x-bc">
			<text class="list-name">管理员：{{userInfo[2]?'是':'否'}}</text>
		</view>
		<!-- 自定义底部导航 -->
		<view class="app-tabbar-wrap">
			<view class="tabbar-box">
				<view class="tabbar-item">
					<button class="btn1" @tap.stop="saveData">解除绑定</button>
				</view>
			</view>
		</view>
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<app-load v-model="isLoading"></app-load>
	</view>
</template>

<script>
	import appModal from '@/components/app-modal/app-modal.vue';
	import {
		mapMutations,
		mapActions,
		mapState
	} from 'vuex';
	export default {
		components: {
			appModal
		},
		data() {
			return {
				isLoading: false,
				isClick: false
			};
		},
		computed: {
			...mapState({
				userInfo: state => state.user.userInfo
			}),
		},
		onLoad() {
			console.log(this.userInfo)
		},
		methods: {
			...mapActions(['getUserInfo']),
			jump(path, parmas) {
				this.$Router.push({
					path: path,
					query: parmas
				});
			},
			saveData() {
				let that = this;
				that.isLoading = true;
				that.isClick = true;
				that.$api('unAudit', {
					"formid": "QDEP_Cust_ShopEmp",
					"data": {
						"Ids": that.userInfo[3],
					},
				}, 1).then(unAuditRes => {
					let unAuditReso = unAuditRes[0];
					if (unAuditRes != null && unAuditRes['Result']['ResponseStatus'][
							'IsSuccess'
						]) {
						//保存
						that.$api('kdSave', {
							"formid": "QDEP_Cust_ShopEmp",
							"data": {
								"NeedUpDataFields": ["FEntity"],
								"NeedReturnFields": ["FEntity"],
								"IsDeleteEntry": false,
								"Model": {
									"FID": that.userInfo[3],
									"FEntity": [{
										"FEntryID": that.userInfo[5],
										"FOpenID": ""
									}]
								},
							}
						}, 1).then(saveRes => {
							let saveReso = saveRes[0];
							if (saveRes['Result']['ResponseStatus']['IsSuccess']) {
								//提交
								that.$api('kdSubmit', {
									"formid": "QDEP_Cust_ShopEmp",
									"data": {
										"Ids": that.userInfo[3],
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
												"Ids": that.userInfo[3],
											},
										}, 1).then(
											auditRes => {
												let auditReso = auditRes[
													0];
												if (auditRes != null &&
													auditRes['Result'][
														'ResponseStatus'
													]['IsSuccess']) {
													that.getUserInfo();
													that.isLoading = false;
													that.isClick = false;
													setTimeout(() => {
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
																prePage
																	.$vm
																	.getGoodsList() // 当返回成功的时候调用上一级页面的回调
															}
														})
													}, 1000);
												} else {
													that.isLoading = false;
													that.isClick = false;
													uni.showToast({
														icon: 'none',
														title: auditReso[
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
										that.isClick = false;
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
								that.isClick = false;
								uni.showToast({
									icon: 'none',
									title: saveRes['Result'][
										'ResponseStatus'
									]['Errors'][0][
										'Message'
									]
								})
							}
						});
					} else {
						that.isLoading = false;
						that.isClick = false;
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
	};
</script>

<style lang="scss">
	.user-list {
		background: #fff;
		height: 100rpx;
		border-bottom: 1rpx solid #f6f6f6;
		padding: 0 20rpx;

		.list-name {
			font-size: 28rpx;
		}

		.avatar {
			width: 67rpx;
			height: 67rpx;
			border-radius: 50%;
			// background: #ccc;
		}

		.cuIcon-right {
			margin-left: 25rpx;
		}

		.list-val {
			color: #999;
			font-size: 28rpxc;
			text-align: right;
		}
	}

	.btn-box {
		margin-top: 60rpx;

		.confirem-btn {
			width: 710rpx;
			height: 80rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			border: 1rpx solid rgba(238, 238, 238, 1);
			border-radius: 40rpx;
			font-size: 30rpx;
			color: rgba(#fff, 0.9);
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
					background-color: #3D7DF2;
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