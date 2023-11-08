<template>
	<view class="bank-wrap">
		<view class="head_box">
			<cu-custom :isBack="true">
				<block slot="backText"></block>
				<block slot="content">绑定用户</block>
			</cu-custom>
		</view>
		<view class="form-box">
			<u-form :model="bankInfo" :rules="rules" ref="uForm" :errorType="errorType">
				<u-form-item class="flex justify-between" :labelStyle="labelStyle" label-width="130"
					label-position="left" label="工号:" prop="WechatNo">
					<u-input style="float: left;width: 500rpx;" placeholder="请输入工号" :placeholderStyle="placeholderStyle"
						v-model="bankInfo.WechatNo" type="text"></u-input>
				</u-form-item>
				<u-form-item class="flex justify-between" :labelStyle="labelStyle" label-width="130"
					label-position="left" label="密码:" prop="password">
					<u-input class="pw-input" placeholder="请输入密码" :placeholderStyle="placeholderStyle"
						v-model="bankInfo.password" type="password"></u-input>
				</u-form-item>
			</u-form>
		</view>
		<view class="notice flex align-center">请填写绑定密码</view>
		<view class="btn-box flex align-center justify-center"><button class="cu-btn confirem-btn"
				@tap="editBankInfo">确定</button></view>
	</view>
</template>

<script>
	import {
		mapState,
		mapActions
	} from 'vuex';
	export default {
		components: {},
		data() {
			return {
				bankInfo: {
					WechatNo: '',
					password: '',
				},
				show: false,
				cardslist: [],
				labelStyle: {
					'font-size': '28rpx',
					'font-weight': '500',
					color: '#333'
				},
				placeholderStyle: 'font-size: 28rpx;color:#c4c4c4;',
				errorType: ['message'],
				rules: {
					WechatNo: [{
						required: true,
						message: '请输入工号',
						trigger: ['change', 'blur']
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: ['change', 'blur']
					}]
				}
			};
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		computed: {
			...mapState({
				userinfo: state => state.user.userInfo,
				
			})
		},
		onLoad(option) {
			if (JSON.stringify(option) != '{}') {
				this.bankInfo.WechatId = option.WechatId;
				this.bankInfo.PublicOpenID = option.PublicOpenID;
			}
			this.bankInfo.phone = this.userinfo.phoneNumber;
			//this.getBankInfo();
		},
		onUnload() {
			var pages = getCurrentPages(); // 获取当前挂载的路由数组
			var prePage = pages[pages.length - 2] //获取 上一个页面
			prePage.$vm.getGoodsList()
		},
		methods: {
			...mapActions(['getUserInfo']),
			confirm(e) {
				this.bankInfo.WechatNo = e[0].value;
			},
			//修改
			editBankInfo() {
				let that = this;
				that.$refs.uForm.validate(valid => {
					if (valid) {
						let params = {
							data: {
								"FilterString": "FDocumentStatus ='C' and FEmpNo ='" + that.bankInfo.WechatNo +
									"' and FWXPwd='" + that.bankInfo.password + "'",
								"FormId": "QDEP_Cust_ShopEmp",
								"OrderString": "FCreateTime ASC",
								"FieldKeys": "FID,FEntity_FEntryID,FEmpNo,FEmpName,FIsManage,FOpenID,FDocumentStatus",
							}
						}
						//查询fid
						that.$api('executeBillQueryAuth', params, 1).then(userRes => {
							let userReso = userRes[0];
							if (userRes.length > 0) {
								if (userReso[5] != "") {
									//反审
									that.$api('unAuditAuth', {
										"formid": "QDEP_Cust_ShopEmp",
										"data": {
											"Ids": userReso[0],
										},
									}, 1).then(unAuditRes => {
										let unAuditReso = unAuditRes[0];
										console.log(unAuditRes!=null && unAuditRes['Result']['ResponseStatus']['IsSuccess'])
										if (unAuditRes!=null && unAuditRes['Result']['ResponseStatus']['IsSuccess']) {
											//保存
											that.$api('kdSaveAuth', {
												"formid": "QDEP_Cust_ShopEmp",
												"data": {
													"NeedUpDataFields": ["FEntity"],
													"NeedReturnFields": ["FEntity"],
													"IsDeleteEntry": false,
													"Model": {
														"FID": userReso[0],
														"FEntity": [
															{
																"FEntryID": userReso[1],
																"FOpenID": uni.getStorageSync(
																	'openid')
															}
														]
													},
												}
											}, 1).then(saveRes => {
												let saveReso = saveRes[0];
												if (saveRes['Result']['ResponseStatus']['IsSuccess']) {
													//提交
													that.$api('kdSubmitAuth', {
														"formid": "QDEP_Cust_ShopEmp",
														"data": {
															"Ids": userReso[0],
														},
													}, 1).then(submitRes => {
														let submitReso = submitRes[0];
														if (submitRes!=null  && submitRes['Result']['ResponseStatus']['IsSuccess']) {
															//审核
															that.$api('kdAuditAuth', {
																"formid": "QDEP_Cust_ShopEmp",
																"data": {
																	"Ids": userReso[0],
																},
															}, 1).then(
																auditRes => {
																	let auditReso =auditRes[0];
																	if (auditRes!=null && auditRes['Result']['ResponseStatus']['IsSuccess']) {
																		that.getUserInfo();
																		setTimeout(() => {
																			var pages = getCurrentPages(); // 获取当前挂载的路由数组
																			var prePage = pages[pages.length - 2] //获取 上一个页面
																			uni.navigateBack({
																				success() {
																						prePage.$vm.getGoodsList() // 当返回成功的时候调用上一级页面的回调
																			     }
																			})
																		}, 1000);
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
														title: saveRes['Result'][
															'ResponseStatus'
														]['Errors'][0][
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
									uni.showToast({
										icon: 'none',
										title: "当前员工已被绑定"
									})
								}
							} else {
								uni.showToast({
									icon: 'none',
									title: userReso[0]['Result']['ResponseStatus']['Errors'][0][
										'Message'
									]
								})
							}
						});
					} else {
						that.$tools.toast('请完善表单');
					}
				});
			}
		}
	};
</script>

<style lang="scss">
	.pw-input {
		.u-input {
			input {
				width: 500rpx !important;
			}
		}
	}

	.head_box {
		background: linear-gradient(125deg, rgba(139, 196, 128, 1) 0%, rgba(148, 120, 165, 1) 100%);
		position: relative;
		color: white;
	}

	.u-form-item {
		margin: 0 20rpx 0 20rpx !important;
	}

	.form-box {
		background: #fff;

		.form-item {
			height: 96rpx;
			border-bottom: 1rpx solid rgba(#dfdfdf, 0.9);
			padding: 0 25rpx;

			.item-title {
				color: #333;
				font-size: 28rpx;
				font-weight: 600;
			}

			.item-input {
				font-size: 28rpx;
				color: #333;
				padding-left: 20rpx;
			}

			.pl-input {
				color: #999;
			}
		}
	}

	.notice {
		color: #999;
		font-size: 24rpx;
		padding: 0 25rpx;
		height: 90rpx;
	}

	.btn-box {
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
</style>