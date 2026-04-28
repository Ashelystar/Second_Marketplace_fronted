<template>
  <div>
    <!-- 页面标题 -->
    <div class="user-page-card p-6 mb-6">
      <h1 class="user-page-title text-gray-900">
        <i class="fa fa-user-circle text-xianyuText"></i>
        个人资料
      </h1>
      <div class="mb-6 flex flex-wrap gap-2 text-sm">
        <span class="px-3 py-1 rounded-full bg-orange-50 text-orange-700">
          用户状态：{{ userStore.userStatus || '未知' }}
        </span>
        <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
          买家权限：{{ userStore.userPermissions.canBuy ? '已开启' : '已关闭' }}
        </span>
        <span class="px-3 py-1 rounded-full bg-green-50 text-green-700">
          卖家权限：{{ userStore.userPermissions.canSell ? '已开启' : '已关闭' }}
        </span>
        <span class="px-3 py-1 rounded-full bg-purple-50 text-purple-700">
          管理员：{{ userStore.userPermissions.isAdmin ? '是' : '否' }}
        </span>
      </div>

      <!-- 基本信息 -->
      <div class="max-w-3xl">
        <!-- 头像 -->
        <div class="mb-8">
          <label class="block text-sm font-medium text-gray-700 mb-3">头像</label>
          <div class="flex items-center gap-6">
            <div class="relative">
              <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
                <img
                  v-if="avatarPreviewUrl || form.avatarUrl"
                  :src="avatarPreviewUrl || form.avatarUrl"
                  alt="头像"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <i class="fa fa-user text-2xl"></i>
                </div>
              </div>
            </div>
            <div>
              <!-- 修改后的代码 -->
              <button @click="triggerFileInput" type="button" class="px-4 py-2 bg-xianyuText text-white rounded-md hover:bg-xianyuTextDark transition">
                上传头像
              </button>
              <!-- 隐藏的文件输入框 -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="handleFileChange"
              />
            </div>
          </div>
          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">头像 URL</label>
            <input
              v-model="form.avatarUrl"
              type="text"
              placeholder="请输入头像链接（http/https）"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
          </div>
        </div>

        <!-- 用户名 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            readonly
            class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
          />
        </div>

        <!-- 昵称 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
          <input
            v-model="form.nickname"
            type="text"
            placeholder="请输入昵称"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
          />
        </div>

        <!-- 性别 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
          <select
            v-model="form.gender"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
          >
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>

        <!-- 生日 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">生日</label>
          <input
            v-model="form.birthday"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
          />
        </div>

        <!-- 个人简介 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
          <textarea
            v-model="form.bio"
            rows="3"
            placeholder="请输入个人简介"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
          ></textarea>
        </div>

        <!-- 城市 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">省份</label>
          <select
            v-model="form.city"
            @change="onCityChange"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
          >
            <option value="">请选择省份</option>
            <option
              v-for="city in cityList"
              :key="city"
              :value="city"
            >
              {{ city }}
            </option>
          </select>
        </div>

        <!-- 区/县 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">城市</label>
          <select
            v-model="form.district"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
          >
            <option value="">请选择城市</option>
            <option
              v-for="district in districtList"
              :key="district"
              :value="district"
            >
              {{ district }}
            </option>
          </select>
        </div>

        <!-- 保存按钮 -->
        <div class="mt-8">
          <button
            @click="handleSave"
            class="w-full py-3 bg-xianyuText text-white rounded-md hover:bg-xianyuTextDark transition font-medium"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import {
  getUserProfileApi,
  updateUserProfileApi,
  uploadAvatarApi,
} from '@/api/user'
// 在已有声明（如 const cityList = ref...）附近添加
const fileInputRef = ref(null)
// 城市列表（示例）
const cityList = ref([
  '河北省',
  '山西省',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '海南省',
  '四川省',
  '贵州省',
  '云南省',
  '陕西省',
  '甘肃省',
  '青海省',
  '台湾省',
  '内蒙古自治区',
  '广西壮族自治区',
  '西藏自治区',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
  '香港特别行政区',
  '澳门特别行政区',
  '北京市',
  '上海市',
  '天津市',
  '重庆市'
])

// 区县映射（示例，实际项目中应从后端或静态数据获取）
const districtMap = {
  '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
  '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
  '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
  '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
  '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
  '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
  '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
  '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
  '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
  '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州'],
  '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
  '广东省': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  '海南省': ['海口市', '三亚市', '三沙市', '儋州市'],
  '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
  '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
  '云南省': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
  '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
  '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
  '青海省': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
  '台湾省': ['台北市', '新北市', '桃园市', '台中市', '台南市', '高雄市'],
  '内蒙古自治区': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
  '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
  '西藏自治区': ['拉萨市', '日喀则市', '山南市', '林芝市', '昌都市', '那曲市', '阿里地区'],
  '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  '新疆维吾尔自治区': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区'],
  '香港特别行政区': ['香港岛', '九龙', '新界'],
  '澳门特别行政区': ['澳门半岛', '氹仔岛', '路环岛'],
  '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
  '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'],
  '重庆市': ['万州区', '黔江区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '綦江区', '大足区', '渝北区', '巴南区', '黔江区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区']
}

// 表单数据（与接口返回字段一致）
const form = reactive({
  avatarUrl: '',
  username: '',
  nickname: '',
  gender: 'male',
  birthday: '',
  bio: '',
  city: '',
  district: ''
})

const districtList = ref([])
const avatarInputRef = ref(null)
const avatarPreviewUrl = ref('')
const isUploadingAvatar = ref(false)
const userStore = useUserStore()

const syncUserInfoToStore = (payload) => {
  const raw = localStorage.getItem('userInfo')
  const cached = raw ? JSON.parse(raw) : {}
  const merged = {
    ...cached,
    ...payload,
  }
  merged.avatar = merged.avatarUrl || merged.avatar || ''
  localStorage.setItem('userInfo', JSON.stringify(merged))

  if (userStore.userInfo) {
    userStore.userInfo = {
      ...userStore.userInfo,
      ...merged,
      avatar: merged.avatar || null,
    }
    return
  }
  userStore.userInfo = {
    ...merged,
    avatar: merged.avatar || null,
  }
}

// 监听城市变化，更新区县列表
const onCityChange = () => {
  const city = form.city
  if (districtMap[city]) {
    districtList.value = districtMap[city]
    // 如果当前选中的区不属于新城市，清空区
    if (!districtList.value.includes(form.district)) {
      form.district = ''
    }
  } else {
    districtList.value = []
    form.district = ''
  }
}

const loadUserInfoFromLocalStorage = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) return

  const userInfo = JSON.parse(userInfoStr)

  form.avatarUrl = userInfo.avatar || ''
  form.username = userInfo.username || ''
  form.nickname = userInfo.nickname || ''
  form.gender = userInfo.gender || 'male'
  form.birthday = userInfo.birthday || ''
  form.bio = userInfo.bio || ''
  form.city = userInfo.city || ''
  form.district = (userInfo.district ?? '').toString().trim()

  // 关键：生成 districtList
  if (form.city && districtMap[form.city]) {
    districtList.value = districtMap[form.city]
  }
  console.log('从 localStorage 加载的用户信息:', form)  // 调试用
}

const fetchUserProfile = async () => {
  try {
    const d = await getUserProfileApi()
    form.avatarUrl = d.avatarUrl || ''
    form.username = d.username || ''
    form.nickname = d.nickname || ''
    form.gender = d.gender || 'male'
    form.birthday = d.birthday || ''
    form.bio = d.bio || ''
    form.city = d.city || ''
    form.district = (d.district ?? '').toString().trim()
    avatarPreviewUrl.value = ''

    if (form.city && districtMap[form.city]) {
      districtList.value = districtMap[form.city]
    }

    syncUserInfoToStore(d)
  } catch (err) {
    console.error('获取用户信息失败', err)
    alert('网络错误，请稍后重试')
  }
}

const handleSave = async () => {
  try {
    await updateUserProfileApi({
      avatarUrl: form.avatarUrl,
      nickname: form.nickname,
      gender: form.gender,
      birthday: form.birthday,
      bio: form.bio,
      city: form.city,
      district: form.district
    })
    alert('修改成功')

    const userInfo = {
      avatarUrl: form.avatarUrl,
      avatar: form.avatarUrl,
      nickname: form.nickname,
      gender: form.gender,
      birthday: form.birthday,
      bio: form.bio,
      city: form.city,
      district: form.district
    }
    syncUserInfoToStore(userInfo)
    avatarPreviewUrl.value = ''
    await userStore.loadUserSecurityInfo()
  } catch (err) {
    console.error('保存失败', err)
    alert('网络错误，请稍后重试')
  }
}
// 触发隐藏的文件输入框点击
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择变化
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    isUploadingAvatar.value = true
    const avatarUrl = await uploadAvatarApi(file)
    form.avatarUrl = avatarUrl
    await handleSave()
    alert('头像上传并更新成功')
  } catch (err) {
    console.error('头像上传失败', err)
    alert(err instanceof Error ? `上传失败: ${err.message}` : '网络错误，请稍后重试')
  } finally {
    isUploadingAvatar.value = false
    // 清空input的值，允许重复选择同一文件
    event.target.value = ''
  }
}
// 页面加载时初始化
onMounted(() => {
  loadUserInfoFromLocalStorage()
  fetchUserProfile()
})
</script>

<style scoped>
.user-page-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
</style>