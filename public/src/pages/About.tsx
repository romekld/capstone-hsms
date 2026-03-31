import { Building2, Users, MapPin, Phone, Mail, Clock, Award } from 'lucide-react';
import { Footer } from '../components/Footer';

export function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-600 text-white rounded-full p-4">
              <Building2 className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About City Health Office II
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Committed to providing quality healthcare services to the residents of Dasmariñas City. 
            Your health and well-being are our top priorities.
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To provide accessible, quality, and comprehensive healthcare services to all residents of Dasmariñas City. 
              We strive to promote health, prevent disease, and enhance the overall well-being of our community 
              through compassionate care and innovative health programs.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To be the leading health office in Cavite, recognized for excellence in public health service delivery, 
              innovative health programs, and commitment to community wellness. We envision a healthy Dasmariñas 
              where every resident has access to quality healthcare.
            </p>
          </div>
        </div>

        {/* Services Overview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Primary Care</h3>
              <p className="text-gray-600 text-sm">
                General health consultations, preventive care, and treatment of common illnesses
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Maternal Health</h3>
              <p className="text-gray-600 text-sm">
                Prenatal care, postpartum support, and maternal health services
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Child Health</h3>
              <p className="text-gray-600 text-sm">
                Immunizations, growth monitoring, and pediatric care
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Emergency Services</h3>
              <p className="text-gray-600 text-sm">
                24/7 emergency response and critical care services
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Health Education</h3>
              <p className="text-gray-600 text-sm">
                Community health programs and wellness education
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Diagnostic Services</h3>
              <p className="text-gray-600 text-sm">
                Laboratory tests and diagnostic procedures
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">
                    Dasmariñas City, Cavite, Philippines
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Hotline</p>
                  <p className="text-gray-600">(046) 123-4567</p>
                  <p className="text-gray-600">Emergency: (046) 123-4568</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-600">cho2@dasma.gov.ph</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Office Hours</p>
                  <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p className="text-gray-600">Saturday: 8:00 AM - 12:00 PM</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                  <p className="text-emerald-600 font-medium">Emergency Services: 24/7</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">
              Visit Us Today
            </h2>
            <p className="text-emerald-700 mb-6">
              Your health is our priority. Visit any of our health centers or call our hotline 
              for immediate assistance. Our dedicated healthcare professionals are ready to serve you.
            </p>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900 mb-2">Main Health Center</h3>
                <p className="text-gray-600 text-sm">
                  Located at the city proper with comprehensive medical facilities
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900 mb-2">Satellite Centers</h3>
                <p className="text-gray-600 text-sm">
                  Multiple locations across Dasmariñas for accessible healthcare
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button className="bg-emerald-700 text-white px-6 py-3 rounded-md font-medium hover:bg-emerald-800 transition-colors">
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
