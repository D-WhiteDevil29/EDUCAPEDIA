import React from 'react';
import "./About.css";
import aboutImg from "../../images/library-img.jpg";

const About = () => {
  return (
    <section className='about'>
      <div className='container'>
        <div className='section-title'>
          <h2>About</h2>
        </div>

        <div className='about-content grid'>
          <div className='about-img'>
            <img src = {aboutImg} alt = "" />
          </div>
          <div className='about-text'>
            <h2 className='about-title hover-underline-animation fs-26 ls-1'>About Educapedia</h2>
            <p className='fs-17'>Welcome to <span className='pHead'>E</span>ducapedia, the ultimate online book library for knowledge and learning. We provide access to a diverse collection of books and resources from around the world, covering a wide range of topics from science and technology to literature and the arts. Our mission is to promote education and personal development through reading and learning.At Educapedia, we believe that knowledge is power, and we are committed to helping people expand their knowledge and pursue their passions. Our online library is easily accessible to anyone with an internet connection, making it convenient for students, professionals, and avid readers to access our resources from anywhere in the world.</p>
            <p className='fs-17'>We strive to create an engaging and interactive learning experience for our users. Our library includes features such as personalized reading lists, bookmarking tools, and discussion groups, to make reading and learning as exciting and interactive as possible.We are passionate about providing resources for people to learn and grow, regardless of their background or circumstances. We believe that education is a lifelong journey and that there is always more to learn. Join our community today and start your journey towards greater understanding and enlightenment with Educapedia.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About;