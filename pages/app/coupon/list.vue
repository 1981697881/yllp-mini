<template>
	<view class="page_box">
		<uni-fab :pattern="pattern" :horizontal="horizontal" :vertical="vertical" cuIcon="scan" :popMenu="popMenu"
			distable :direction="direction" @fabClick="fabClick"></uni-fab>
		<view class="head_box">
			<view class="search-box flex align-center" @tap.stop>
				<input @confirm="onSearch" @input="onInput" confirm-type="搜索" class="search flex-sub" type="text"
					v-model="searchVal" placeholder="搜索" />
				<text v-show="searchVal" @tap="clearSearch" class="cuIcon-roundclosefill"></text>
			</view>
			<view class="coupon-nav x-f">
				<view class="nav-item y-f" v-for="nav in couponsState" :key="nav.id" @tap="onNav(nav.id,nav.title)">
					<view class="item-title">{{ nav.title }}</view>
					<text class="nav-line" :class="{ 'line-active': stateCurrent === nav.id }"></text>
				</view>
			</view>
		</view>
		<view class="content_box">
			<view class="coupon-list" v-for="(c, index) in couponList" :key="index" @tap="toCouponDetail(c)">
				<app-coupon :state="stateCurrent" :couponData="c" @getCouponList="getCouponIssueList"></app-coupon>
			</view>
		</view>
		<view class="foot_box"></view>
		<!-- 自定义底部导航 -->
		<!-- 关注弹窗 -->
		<app-float-btn></app-float-btn>
		<!-- 连续弹窗提醒 -->
		<app-notice-modal></app-notice-modal>
		<!-- 登录提示 
		<app-login-modal></app-login-modal>-->
	</view>
</template>

<script>
	import appCoupon from '@/components/app-coupon/app-coupon.vue';
	export default {
		components: {
			appCoupon
		},
		data() {
			return {
				stateCurrent: 0,
				listParams: {
					couponType: 0,
					openId: uni.getStorageSync('openid'),
					status: 0
				},
				horizontal: 'right',
				vertical: 'bottom',
				popMenu: false,
				direction: 'horizontal',
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#9198e5',
					buttonColor: '#9198e5'
				},
				status: "全部",
				searchVal: '',
				couponsState: [{
						id: 0,
						title: '全部'
					},
					{
						id: 1,
						title: '待发货'
					},
					{
						id: 2,
						title: '待收货'
					},
					{
						id: 3,
						title: '已收货'
					},
					{
						id: 4,
						title: '已入库'
					}
				],
				couponList: []
			};
		},
		computed: {},
		onShow() {
			this.getCouponList();;
		},
		methods: {
			fabClick() {
				let that = this;
				uni.scanCode({
					success: function(res) {
						console.log(res.result)
						let obj = {};
						obj.type = 1;
						obj.detail = res.result;
						that.jump('/pages/index/videoGame', obj);
					}
				});
			},
			onNav(id, value) {
				this.stateCurrent = id;
				this.status = value;
				this.couponList = [];
				this.getCouponList();
			},
			jump(path, parmas) {
				this.$Router.push({
					path: path,
					query: parmas
				});
			},
			onSearch() {
				this.getCouponList()
			},
			getCouponList() {
				let that = this;
				that.loadStatus = 'loading';
				let params;
				if (that.stateCurrent == 0) {
					if (that.searchVal != '') {
						params = {
							data: {
								"FilterString": "FDocumentStatus ='C' and FBillNo='" + that.searchVal + "'",
								"FormId": "SAL_OUTSTOCK",
								"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
								"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel",
								"Limit": "20"
							}
						}
					} else {
						params = {
							data: {
								"FilterString": "FDocumentStatus ='C'",
								"FormId": "SAL_OUTSTOCK",
								"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
								"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel",
								"Limit": "20"
							}
						}
					}
				} else if(that.stateCurrent == 1){
					if (that.searchVal != '') {
						params = {
							data: {
								"FilterString": "FDocumentStatus ='C' and FOutStatus='' and FBillNo='" + that.searchVal + "'",
								"FormId": "SAL_OUTSTOCK",
								"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
								"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel",
								"Limit": "20"
							}
						}
					} else {
						params = {
							data: {
								"FilterString": "FDocumentStatus ='C' and FOutStatus=''",
								"FormId": "SAL_OUTSTOCK",
								"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
								"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel",
								"Limit": "20"
							}
						}
					}
				}else{
					if (that.searchVal != '') {
						params = {
							data: {
								"FilterString": "FDocumentStatus ='C' and FOutStatus='" + that.status +
									"' and FBillNo='" + that.searchVal + "'",
								"FormId": "SAL_OUTSTOCK",
								"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
								"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel",
								"Limit": "20"
							}
						}
					} else {
						params = {
							data: {
								"FilterString": "FDocumentStatus ='C' and FOutStatus='" + that.status + "'",
								"FormId": "SAL_OUTSTOCK",
								"OrderString": "FBillNo ASC,FMaterialId.FNumber ASC",
								"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate,FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel",
								"Limit": "20"
							}
						}
					}

				}
				that.$api('executeBillQuery', params, 1).then(res => {
					let reso = res[0];
					if (res.length > 0) {
						that.isLoading = false;
						that.couponList = res;
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
			//详情
			toCouponDetail(val) {
				let obj = {};
				obj.detail = JSON.stringify(val);
				obj.type = 0;
				this.jump('/pages/index/videoGame', obj);
			}
		}
	};
</script>

<style lang="scss">
	.page_box {
		background: #f3f3f3;
	}

	.search-box {
		width: 680rpx;
		height: 60rpx;
		background: rgba(245, 245, 245, 1);
		border-radius: 30rpx;
		margin: 0 10rpx;

		.search {
			text-align: left;
			font-size: 28rpx;
		}

		.cuIcon-roundclosefill {
			color: #d5a65a;
			padding: 0 10rpx;
		}
	}

	.coupon-nav {
		background: #fff;
		height: 100rpx;

		.nav-item {
			flex: 1;

			.item-title {
				font-size: 30rpx;
				font-family: PingFang SC;
				font-weight: 400;
				color: rgba(51, 51, 51, 1);
				line-height: 76rpx;
			}

			.nav-line {
				width: 120rpx;
				height: 4rpx;
				background: #fff;
			}

			.line-active {
				background: rgba(230, 184, 115, 1);
			}
		}
	}

	.coupon-list {
		margin: 30rpx 20rpx;
	}
</style>