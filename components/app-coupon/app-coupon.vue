<template>
	<view class="" v-if="couponData">
		<view class="coupon-wrap">
			<view class="coupon-item">
				<view class="coupon-left ">
					<view class="sum-box">
						<text class="unit">订单号：{{couponData[0]}}</text>
					</view>
					<view class="notice">{{couponData[15]==''?'待发货':couponData[15]}}</view>
				</view>
				<view class="coupon-center">
					<view class="sum-box">
						<text class="unit"><text style="color:#8D9097">出库时间：</text>{{couponData[3].substring(0, 10)}}</text>
					</view>
					<view class="notice">单据数量：{{couponData[12]}}</view>
				</view>
				<view class="noticet">物料名称：<text class="text-black">{{couponData[6]}}</text></view>
				<!-- <view class="coupon-right">
					<button class="cu-btn get-btn" v-if="couponData[15] != '已入库'">入库V8</button>
					<button class="cu-btn get-btn bg-blue" v-if="couponData[15] != '已收货' && couponData[15] != '已入库'" @tap.stop="onSubmit(couponData)">确认收货</button>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'appCoupon',
	components: {},
	data() {
		return {
			tools: this.$tools
		};
	},
	props: {
		state: {}, //0:立即领取，1：去使用，2：查看详情，3：已失效。
		couponData: {}
	},
	computed: {},
	methods: {
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		getCoupon() {
			let that = this;
			let params = this.couponData
			params.openId = uni.getStorageSync('openid')
			that.$api('coupons.get', params).then(res => {
				if (res.flag) {
					that.$tools.toast(res.msg);
					that.$emit('getCouponList')
				}else{
					that.$tools.toast(res.msg);
				}
			});
		},
		onSubmit(val){
			let that = this
			//反审
			that.$api('unAudit', {
				"formid": "SAL_OUTSTOCK",
				"data": {
					"Ids": val[14],
				},
			}, 1).then(unAuditRes => {
				let unAuditReso = unAuditRes[0];
				if (unAuditRes != null && unAuditRes['Result']['ResponseStatus'][
						'IsSuccess'
					]) {
					//禁用
					that.$api('kdSave', {
						"formid": "SAL_OUTSTOCK",
						"data": {
							"NeedUpDataFields": ["FEntity"],
							"NeedReturnFields": ["FEntity"],
							"IsDeleteEntry": false,
							"Model": {
								"FID": val[14],
								"FOutStatus": "已收货",
								/* "FRecTime": "",
								"FRecTime": "",
								"FEntity": "", */
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
											"Ids": val[14],
										},
									}, 1).then(submitRes => {
										let submitReso = submitRes[0];
										if (submitRes!=null  && submitRes['Result']['ResponseStatus']['IsSuccess']) {
											//审核
											that.$api('kdAudit', {
												"formid": "SAL_OUTSTOCK",
												"data": {
													"Ids": val[14],
												},
											}, 1).then(
												saveRes => {
													let saveReso =saveRes[0];
													if (saveRes!=null && saveRes['Result']['ResponseStatus']['IsSuccess']) {
														that.$parent.getCouponList();
													} else {
														uni.showToast({
															icon: 'none',
															title: submitRes[
																	'Result'
																	]
																[
																	'ResponseStatus']
																[
																	'Errors']
																[
																	0]
																[
																	'Message']
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
														'Errors']
													[0][
														'Message']
											})
										}
									});
								
							} else {
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
// 未领取，已领取
.coupon-wrap {
	background-color: white;
	background-size: 100% 100%;
	position: relative;
	border-radius: 10rpx;
	width: 710rpx;
	.coupon-item {
		width: 100%;
		height: auto;
		padding: 10rpx;
		border-radius: 10rpx;

		.coupon-left {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding-left: 10rpx;
			line-height: 60rpx;
			border-bottom: 1px solid #eeeeee;
			.unit {
				color: #4f3a1e;
			}

			.sum {
				font-size: 55rpx;
				font-weight: bold;
				color: #4f3a1e;
				line-height: 55rpx;
				padding-right: 10rpx;
			}

			.sub {
				font-size: 26rpx;
				color: #4f3a1e;
			}

			.notice {
				color: #3D7DF2;
				margin-top: 6rpx;
				padding-right: 10rpx;
			}
		}.coupon-center {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding-left: 10rpx;
			line-height: 60rpx;
			.unit {
				
			}
			.sum {
				font-size: 55rpx;
				font-weight: bold;
				color: #4f3a1e;
				line-height: 55rpx;
				padding-right: 10rpx;
			}

			.sub {
				font-size: 26rpx;
				color: #4f3a1e;
			}

			.notice {
				color: #4f3a1e;
				margin-top: 6rpx;
				padding-right: 10rpx;
			}
		}
		.noticet{
			padding-left: 10rpx;
			line-height: 60rpx;
			color: #8D9097;
		}
		.coupon-right {
			border-top:  1px solid #eeeeee;
			padding-top: 20rpx;
			justify-content: center;
			align-items: center;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;	
			.get-btn {
				width: 182rpx;
				height: 84rpx;
				background: #10C1B3;
				border-radius: 50rpx;
				margin-left: 20rpx;
				font-family: PingFang SC;
				color: white;
			}

			.surplus-num {
				font-size: 22rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(168, 112, 13, 1);
				margin-top: 14rpx;
			}
		}
	}
}

// 失效
.close-wrap {
	position: relative;
	border-radius: 10rpx;
	background: url('https://cfzx.gzfzdev.com/movie/uploadFiles/image/coupon_bg2.png') no-repeat;
	background-size: 100% 100%;

	.coupon-item {
		width: 100%;
		height: 168rpx;
		border-radius: 10rpx;

		.coupon-left {
			height: 100%;
			width: 480rpx;
			justify-content: center;
			padding-left: 40rpx;

			.unit {
				font-size: 24rpx;
				color: #838383;
			}

			.sum {
				font-size: 55rpx;
				font-weight: bold;
				color: #838383;
				line-height: 55rpx;
				padding-right: 10rpx;
			}

			.sub {
				font-size: 26rpx;
				color: #838383;
			}

			.notice {
				font-size: 22rpx;
				color: #a6a6a6;
			}
		}

		.coupon-right {
			height: 100%;
			flex: 1;
			justify-content: center;

			.get-btn {
				width: 162rpx;
				height: 64rpx;
				background: #fff;
				font-family: PingFang SC;
				font-weight: bold;
				color: #838383;
			}

			.surplus-num {
				font-size: 22rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(168, 112, 13, 1);
				margin-top: 14rpx;
			}
		}
	}
}
</style>
